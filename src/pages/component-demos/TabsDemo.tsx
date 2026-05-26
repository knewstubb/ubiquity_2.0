import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TabsDemoProps {
  'tab-count'?: number
  'show-badge'?: boolean
  orientation?: string
  'show-content'?: boolean
  variant?: string
  size?: string
}

export default function TabsDemo(props: TabsDemoProps) {
  const tabCount = props['tab-count']
  const showBadge = props['show-badge'] ?? false
  const orientation = props.orientation
  const showContent = props['show-content']
  const variant = (props.variant ?? 'pill') as 'pill' | 'underline'
  const size = (props.size ?? 'default') as 'default' | 'compact'

  const hasControls = tabCount !== undefined

  if (hasControls) {
    const tabLabels = ['Overview', 'Analytics', 'Settings', 'Reports', 'Activity', 'Logs']
    const tabDescriptions = [
      'Summary of your campaign performance this month.',
      'Detailed performance metrics and trends.',
      'Configure campaign defaults and preferences.',
      'Generated reports and exports.',
      'Recent activity and audit log.',
      'System logs and debugging info.',
    ]
    const badgeCounts = [12, 5, 3, 8, 2, 1]
    const tabs = Array.from({ length: tabCount }, (_, i) => ({
      value: `tab-${i}`,
      label: tabLabels[i] || `Tab ${i + 1}`,
      description: tabDescriptions[i] || `Content for tab ${i + 1}.`,
      badge: showBadge ? badgeCounts[i] : undefined,
    }))

    return (
      <div className="max-w-lg">
        <Tabs defaultValue="tab-0" orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'} className={orientation === 'vertical' ? 'flex gap-4' : ''}>
          <TabsList variant={variant} size={size} className={orientation === 'vertical' ? 'flex-col h-auto' : ''}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} badge={tab.badge}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {showContent && tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card>
                <CardHeader>
                  <CardTitle>{tab.label}</CardTitle>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the content panel for the {tab.label} tab.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>Summary of your campaign performance this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have sent 12 campaigns reaching 45,000 contacts with an average open rate of 38%.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed performance metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click-through rate is up 15% compared to last month. Top performing segment: Gold Members.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure campaign defaults.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Default sender: marketing@acme.com. Reply-to: support@acme.com.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
