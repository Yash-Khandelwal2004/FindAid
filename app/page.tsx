import Link from "next/link";
import {
  Heart,
  Search,
  HandHeart,
  CheckCircle,
  Droplets,
  Wind,
  Accessibility,
  Pill,
  Stethoscope,
  MoreHorizontal,
  ArrowRight,
  Shield,
  Clock,
  Users,
} from "lucide-react";

const CATEGORIES = [
  {
    icon: Droplets,
    label: "Blood",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  { icon: Wind, label: "Oxygen", color: "text-blue-400", bg: "bg-blue-500/10" },
  {
    icon: Accessibility,
    label: "Wheelchair",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Pill,
    label: "Medicine",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Stethoscope,
    label: "Equipment",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: MoreHorizontal,
    label: "Other",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Find what you need",
    desc: "Search listings by category, city or blood group. Filter by urgency to find critical items first.",
  },
  {
    step: "02",
    icon: HandHeart,
    title: "Send a request",
    desc: "Explain your need and send a borrow request. The owner reviews and approves it.",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Collect and return",
    desc: "Coordinate with the owner to pick up the item. Return it when you no longer need it.",
  },
];

const STATS = [
  { icon: Users, value: "500+", label: "Registered donors" },
  { icon: Heart, value: "1,200+", label: "Items shared" },
  { icon: Clock, value: "< 2hrs", label: "Avg. response time" },
  { icon: Shield, value: "100%", label: "Free to use" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero  */}
      <section className="px-4 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-6">
          <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
          Emergency aid sharing platform
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
          Share aid. <span className="text-destructive">Save lives.</span>
        </h1>

        {/* Subtext */}
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          FindAid connects people who need emergency medical aid with those who
          can lend it — blood, oxygen, wheelchairs and more.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Find Aid Near You
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Post an Aid Item
          </Link>
        </div>
      </section>

      {/* ── Stats  */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works  */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Getting aid to someone in need takes just three steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="bg-card border border-border rounded-xl p-6 relative"
            >
              <span className="absolute top-4 right-4 text-4xl font-bold text-muted-foreground/20 select-none pointer-events-none">
                {step}
              </span>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories  */}
      <section className="bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              What can you find?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From critical blood donations to mobility aids — FindAid covers
              all emergency medical needs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(({ icon: Icon, label, color, bg }) => (
              <Link
                key={label}
                href={`/listings?category=${label.toLowerCase()}`}
                className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-muted-foreground/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA  */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-card border border-border rounded-2xl p-10">
          <Heart className="w-10 h-10 text-destructive fill-destructive mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to make a difference?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of people sharing emergency aid across India. It's
            free, it's fast, and it saves lives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create free account
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Browse listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
