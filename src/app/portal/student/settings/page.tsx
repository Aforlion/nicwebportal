import { redirect } from "next/navigation"

export default function StudentSettingsPage() {
    // Redirect to the newly implemented profile page
    redirect('/portal/student/profile')
}
