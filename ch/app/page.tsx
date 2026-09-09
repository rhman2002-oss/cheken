import { FeaturedItems } from '@/components/featured-items'
import { FinalCta } from '@/components/final-cta'
import { Hero } from '@/components/hero'
import { Spotlight } from '@/components/spotlight'
import { Stats } from '@/components/stats'

export default function Page() {
  return (
    <main className="relative min-h-svh bg-background text-foreground">
      <Hero />
      <FeaturedItems />
      <Spotlight />
      <Stats />
      <FinalCta />
      <footer className="border-t border-border px-6 py-10 text-center text-sm text-muted-foreground">
        جكن اكسبريس © {new Date().getFullYear()} — طعم يستاهل السهرة
      </footer>
    </main>
  )
}
