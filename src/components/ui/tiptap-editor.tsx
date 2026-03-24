"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { ChartExtension } from '@/lib/tiptap-chart-extension'
import {
    Bold, Italic, Heading1, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
    Table as TableIcon, Trash, Unlink, RotateCcw, RotateCw, Rows, Columns, BarChart2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
    const [isUploading, setIsUploading] = useState(false)

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) {
            return
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${file.name.replace(/\s+/g, '_')}`
            const filePath = `uploads/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('course-resources')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('course-resources')
                .getPublicUrl(filePath)

            editor.chain().focus().setImage({ src: publicUrl }).run()
            toast.success("Image uploaded successfully")
        } catch (error: any) {
            console.error('Error uploading image:', error)
            toast.error(error.message || "Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const addImageFallback = useCallback(() => {
        const url = window.prompt('URL of the image:')

        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/50 rounded-t-md">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-6 bg-border mx-1" />
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-6 bg-border mx-1" />
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <div className="w-px h-6 bg-border mx-1" />
            <Toggle
                size="sm"
                pressed={editor.isActive('link')}
                onPressedChange={setLink}
            >
                <LinkIcon className="h-4 w-4" />
            </Toggle>
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
            >
                <Unlink className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            
            {/* Automatic Image Upload */}
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    title="Upload Image"
                />
                <Button size="icon" variant="ghost" className="h-9 w-9" type="button" disabled={isUploading}>
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />
            
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => editor.chain().focus().insertChart({ type: 'bar', data: [], title: 'New Chart' }).run()}
                title="Insert Chart"
            >
                <BarChart2 className="h-4 w-4 text-blue-500" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />
            <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
                <TableIcon className="h-4 w-4" />
            </Button>
            
            {editor.isActive('table') && (
                <>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-blue-600" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
                        <Columns className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-blue-600" onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
                        <Rows className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                        <Trash className="h-4 w-4" />
                    </Button>
                </>
            )}

            <div className="flex-1" />
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <RotateCw className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'w-full border-collapse border border-border my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border bg-muted font-bold p-2 text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2',
                },
            }),
            ChartExtension,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="border rounded-md bg-background overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="flex-1 bg-background max-h-[600px] overflow-y-auto" />
            {/* Custom CSS for Table sizing inside Prose */}
            <style jsx global>{`
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                }
                .ProseMirror td, .ProseMirror th {
                    min-width: 1em;
                    border: 1px solid theme('colors.border');
                    padding: 8px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    font-weight: bold;
                    text-align: left;
                    background-color: theme('colors.muted.DEFAULT');
                }
            `}</style>
        </div>
    )
}
