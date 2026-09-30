import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { MoneyText } from "@/components/common/money-text";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
export default function Styleguide() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <Head title="Styleguide" />

      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Design Tokens & Theme</h1>
            <p className="mt-2 text-muted-foreground">
              A comprehensive guide to the Nisala Travels design system.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Colors */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Colors</h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-medium">Brand Palette</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ColorSwatch
                  name="Background"
                  variable="bg-background"
                  text="text-foreground"
                  border
                />
                <ColorSwatch
                  name="Foreground"
                  variable="bg-foreground"
                  text="text-background"
                />
                <ColorSwatch
                  name="Primary"
                  variable="bg-primary"
                  text="text-primary-foreground"
                />
                <ColorSwatch
                  name="Accent"
                  variable="bg-accent"
                  text="text-accent-foreground"
                />
                <ColorSwatch
                  name="Secondary"
                  variable="bg-secondary"
                  text="text-secondary-foreground"
                />
                <ColorSwatch
                  name="Muted"
                  variable="bg-muted"
                  text="text-muted-foreground"
                />
                <ColorSwatch
                  name="Card"
                  variable="bg-card"
                  text="text-card-foreground"
                  border
                />
                <ColorSwatch
                  name="Popover"
                  variable="bg-popover"
                  text="text-popover-foreground"
                  border
                />
                <ColorSwatch
                  name="Border"
                  variable="bg-border"
                  text="text-foreground"
                />
                <ColorSwatch
                  name="Input"
                  variable="bg-input"
                  text="text-foreground"
                />
                <ColorSwatch
                  name="Ring"
                  variable="bg-ring"
                  text="text-foreground"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Status Colors</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ColorSwatch
                  name="Success"
                  variable="bg-success"
                  text="text-success-foreground"
                />
                <ColorSwatch
                  name="Warning"
                  variable="bg-warning"
                  text="text-warning-foreground"
                />
                <ColorSwatch
                  name="Error"
                  variable="bg-error"
                  text="text-error-foreground"
                />
                <ColorSwatch
                  name="Info"
                  variable="bg-info"
                  text="text-info-foreground"
                />
                <ColorSwatch
                  name="Destructive"
                  variable="bg-destructive"
                  text="text-destructive-foreground"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Neutral Scale</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5 lg:grid-cols-10">
                <ColorSwatch
                  name="50"
                  variable="bg-neutral-50"
                  text="text-neutral-900"
                  border
                  small
                />
                <ColorSwatch
                  name="100"
                  variable="bg-neutral-100"
                  text="text-neutral-900"
                  border
                  small
                />
                <ColorSwatch
                  name="200"
                  variable="bg-neutral-200"
                  text="text-neutral-900"
                  small
                />
                <ColorSwatch
                  name="300"
                  variable="bg-neutral-300"
                  text="text-neutral-900"
                  small
                />
                <ColorSwatch
                  name="400"
                  variable="bg-neutral-400"
                  text="text-neutral-900"
                  small
                />
                <ColorSwatch
                  name="500"
                  variable="bg-neutral-500"
                  text="text-neutral-50"
                  small
                />
                <ColorSwatch
                  name="600"
                  variable="bg-neutral-600"
                  text="text-neutral-50"
                  small
                />
                <ColorSwatch
                  name="700"
                  variable="bg-neutral-700"
                  text="text-neutral-50"
                  small
                />
                <ColorSwatch
                  name="800"
                  variable="bg-neutral-800"
                  text="text-neutral-50"
                  small
                />
                <ColorSwatch
                  name="900"
                  variable="bg-neutral-900"
                  text="text-neutral-50"
                  small
                />
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Typography</h2>
          <Card>
            <CardContent className="divide-y pt-6">
              <TypeRow size="xs" rem="0.75rem" />
              <TypeRow size="sm" rem="0.875rem" />
              <TypeRow size="base" rem="1rem" />
              <TypeRow size="lg" rem="1.125rem" />
              <TypeRow size="xl" rem="1.25rem" />
              <TypeRow size="2xl" rem="1.5rem" />
              <TypeRow size="3xl" rem="1.875rem" />
              <TypeRow size="4xl" rem="2.25rem" />
            </CardContent>
          </Card>
        </section>

        {/* Spacing */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">
            Spacing (Custom extensions)
          </h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <SpacingRow name="18" rem="4.5rem" px="72px" className="w-18" />
              <SpacingRow name="22" rem="5.5rem" px="88px" className="w-22" />
              <SpacingRow name="26" rem="6.5rem" px="104px" className="w-26" />
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Shadows */}
          <section className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-semibold">Shadows</h2>
            <div className="space-y-6">
              <ShadowBox name="sm" className="shadow-sm" />
              <ShadowBox name="DEFAULT" className="shadow" />
              <ShadowBox name="md" className="shadow-md" />
              <ShadowBox name="lg" className="shadow-lg" />
              <ShadowBox name="xl" className="shadow-xl" />
            </div>
          </section>

          {/* Border Radii */}
          <section className="space-y-6">
            <h2 className="border-b pb-2 text-2xl font-semibold">
              Border Radii
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <RadiusBox name="sm" className="rounded-sm" />
              <RadiusBox name="md" className="rounded-md" />
              <RadiusBox name="lg" className="rounded-lg" />
              <RadiusBox name="xl" className="rounded-xl" />
              <RadiusBox name="2xl" className="rounded-2xl" />
              <RadiusBox name="3xl" className="rounded-3xl" />
              <RadiusBox name="4xl" className="rounded-4xl" />
              <RadiusBox name="full" className="rounded-full" />
            </div>
          </section>
        </div>

        {/* Custom Components */}
        <section className="space-y-6">
          <h2 className="border-b pb-2 text-2xl font-semibold">Core Components</h2>
          
          <div className="space-y-12">
            {/* StatusBadge */}
            <div>
              <h3 className="mb-4 text-lg font-medium">StatusBadge</h3>
              <p className="mb-4 text-sm text-muted-foreground">Used for domain states (booking, payment, document).</p>
              <div className="flex flex-wrap gap-4">
                <StatusBadge type="booking" status="Pending" />
                <StatusBadge type="booking" status="Confirmed" />
                <StatusBadge type="payment" status="Paid" />
                <StatusBadge type="payment" status="Unpaid" />
                <StatusBadge type="document" status="Pending Review" />
                <StatusBadge type="document" status="Rejected" />
              </div>
            </div>

            {/* MoneyText */}
            <div>
              <h3 className="mb-4 text-lg font-medium">MoneyText</h3>
              <p className="mb-4 text-sm text-muted-foreground">Formats currency properly with size and weight variants.</p>
              <div className="flex flex-col gap-2">
                <MoneyText amount={15000} currency="LKR" />
                <MoneyText amount={15000} currency="LKR" weight="bold" size="lg" />
                <MoneyText amount={250.5} currency="USD" weight="semibold" size="2xl" />
              </div>
            </div>

            {/* PageHeader and Breadcrumbs */}
            <div>
              <h3 className="mb-4 text-lg font-medium">PageHeader & Breadcrumbs</h3>
              <div className="rounded-lg border p-6 bg-card">
                <PageHeader 
                  title="Dashboard" 
                  description="Welcome back to the portal."
                  breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Portal", href: "/portal" },
                    { label: "Dashboard" }
                  ]}
                  actions={<Button>New Booking</Button>}
                />
              </div>
            </div>

            {/* DatePicker */}
            <div>
              <h3 className="mb-4 text-lg font-medium">DatePicker</h3>
              <p className="mb-4 text-sm text-muted-foreground">A unified DatePicker combining Popover and Calendar.</p>
              <DatePicker value={date} onChange={setDate} />
            </div>

            {/* ConfirmDialog */}
            <div>
              <h3 className="mb-4 text-lg font-medium">ConfirmDialog</h3>
              <p className="mb-4 text-sm text-muted-foreground">Accessible confirmation modal.</p>
              <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>Open Danger Dialog</Button>
              <ConfirmDialog 
                open={isConfirmOpen} 
                onOpenChange={setIsConfirmOpen} 
                title="Are you absolutely sure?" 
                description="This action cannot be undone. This will permanently delete this record."
                isDanger
                onConfirm={() => setIsConfirmOpen(false)}
              />
            </div>

            {/* EmptyState and ErrorState */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-4 text-lg font-medium">EmptyState</h3>
                <EmptyState 
                  icon={Inbox} 
                  title="No records found" 
                  description="Get started by creating a new record." 
                  actionLabel="Create Record"
                  onAction={() => alert("Action triggered")}
                />
              </div>
              <div>
                <h3 className="mb-4 text-lg font-medium">ErrorState</h3>
                <ErrorState 
                  icon={AlertCircle} 
                  title="Failed to load data" 
                  description="An unexpected error occurred while communicating with the server." 
                  onRetry={() => alert("Retry triggered")}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  variable,
  text,
  border = false,
  small = false,
}: {
  name: string;
  variable: string;
  text: string;
  border?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`flex ${small ? "h-16" : "h-24"} flex-col justify-end rounded-md p-3 ${variable} ${text} ${border ? "border" : ""}`}
    >
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

function TypeRow({ size, rem }: { size: string; rem: string }) {
  return (
    <div className="flex items-center py-4">
      <div className="w-24 shrink-0 text-sm text-muted-foreground">
        text-{size}
        <br />
        {rem}
      </div>
      <div className={`truncate font-sans text-${size}`}>
        The quick brown fox jumps over the lazy dog.
      </div>
    </div>
  );
}

function SpacingRow({
  name,
  rem,
  px,
  className,
}: {
  name: string;
  rem: string;
  px: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 shrink-0 text-sm text-muted-foreground">{name}</div>
      <div className={`h-8 rounded-sm bg-primary ${className}`} />
      <div className="text-sm text-muted-foreground">
        {rem} / {px}
      </div>
    </div>
  );
}

function ShadowBox({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 shrink-0 text-sm text-muted-foreground">{name}</div>
      <div
        className={`flex h-16 flex-1 items-center justify-center rounded-md border bg-card ${className}`}
      >
        <span className="text-sm text-card-foreground">
          shadow-{name === "DEFAULT" ? "" : name}
        </span>
      </div>
    </div>
  );
}

function RadiusBox({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`flex h-24 items-center justify-center border bg-card ${className}`}
    >
      <span className="text-sm text-card-foreground text-center">
        rounded-{name}
      </span>
    </div>
  );
}
