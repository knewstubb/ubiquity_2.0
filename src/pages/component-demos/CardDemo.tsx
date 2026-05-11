import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CardDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Overview of your latest email campaign results.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Open Rate</span>
              <span className="font-medium">42.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Click Rate</span>
              <span className="font-medium">8.7%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unsubscribes</span>
              <span className="font-medium">0.2%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View Full Report</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience Growth</CardTitle>
          <CardDescription>New contacts added this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">+1,234</div>
          <p className="text-sm text-muted-foreground mt-1">
            12% increase from last month
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm">View Contacts</Button>
          <Button size="sm" variant="outline">Export</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
