import { Metadata } from "next"
import { MemberRegistrationForm } from "@/components/member-registration-form"

export const metadata: Metadata = {
    title: "Join NIC | Member Registration",
    description: "Register as a member of the National Institute of Caregivers",
}

export default function JoinPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <section className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Become a Member
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg opacity-90">
                        Join the national community of professional caregivers. Complete your registration below to receive your membership ID and access exclusive benefits.
                    </p>
                </div>
            </section>

            {/* Registration Form */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <MemberRegistrationForm />
                </div>
            </section>
        </div>
    )
}
