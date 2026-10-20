'use client'

import { useEffect, useRef } from 'react'

interface LessonScrollResetProps {
    activeId: string
}

export default function LessonScrollReset({ activeId }: LessonScrollResetProps) {
    const prevIdRef = useRef(activeId)

    useEffect(() => {
        // Find the main scroll container and scroll to top
        const container = document.getElementById('lesson-content-scroll-container')
        if (container) {
            container.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
        window.scrollTo({ top: 0, left: 0 })
        prevIdRef.current = activeId
    }, [activeId])

    return null
}
