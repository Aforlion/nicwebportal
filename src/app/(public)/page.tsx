import { Hero } from "@/components/hero"
import { MandateSection } from "@/components/mandate-section"

export default function Home() {
  return (
    <>
      <Hero />
      <MandateSection />

      {/* Additional sections can be added here as the project grows */}
      <section className="bg-primary py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-3xl font-bold">Ready to become a certified Caregiver?</h2>
          <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals already certified by the National Institute of Caregivers. Start your journey today and help us provide the dignity and care our citizens deserve.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-primary rounded-md px-8 py-3 font-bold hover:bg-opacity-90 transition-colors">
              Enrol Now
            </button>
            <button className="bg-transparent border-2 border-white text-white rounded-md px-8 py-3 font-bold hover:bg-white hover:text-primary transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
