import { Metadata } from "next"
import { FacilityRegistrationForm } from "@/components/facility-registration-form"

export const metadata: Metadata = {
    title: "Facility Registration | NIC",
    description: "Register your care facility as a certified NIC Care Partner",
}

export default function FacilityJoinPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Institutional Registration
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Join the NIC Institutional Registry. Register your Nursing Home, Hospital, or Agency to access verified caregiving talent and professional certification for your facility.
                    </p>
                </div>
            </section>

            {/* Registration Form */}
            <section className="py-20 -mt-10">
                <div className="container mx-auto px-4">
                    <FacilityRegistrationForm />
                </div>
            </section>
        </div>
    )
}
