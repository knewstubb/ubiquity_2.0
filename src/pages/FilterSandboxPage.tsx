import { useState } from 'react';
import { Plus, X, ArrowsClockwise } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

// ─── Shared Types & Constants ───────────────────────────────────────────────

const FIELDS = ['First Name', 'Last Name', 'Email', 'Created Date', 'Total Spend', 'Status', 'Tags'] as const;
const TEXT_OPERATORS = ['equals', 'not equals', 'contains', 'starts with', 'is blank', 'is not blank'] as const;
const NUMBER_OPERATORS = ['equals', 'greater than', 'less than', 'between', 'is blank'] as const;
const DATE_OPERATORS = ['before', 'after', 'in last N days', 'between', 'is blank'] as const;
const TAG_OPERATORS = ['includes any', 'includes all', 'excludes', 'is blank'] as const;

type FieldName = typeof FIELDS[number];

function getOperators(field: FieldName): readonly string[] {
  if (field === 'Total Spend') return NUMBER_OPERATORS;
  if (field === 'Created Date') return DATE_OPERATORS;
  if (field === 'Tags') return TAG_OPERATORS;
  if (field === 'Status') return ['equals', 'not equals', 'is blank'];
  return TEXT_OPERATORS;
}

interface Condition {
  id: string;
  field: FieldName;
  operator: string;
  value: string;
}

let nextId = 1;
function genId() { return `cond-${nextId++}`; }

function makeCondition(): Condition {
  return { id: genId(), field: 'Email', operator: 'contains', value: '' };
}

// ─── Condition Row (shared) ────────────────────────────────────────────────

function ConditionRow({ condition, onChange, onRemove }: {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
      <Select value={condition.field} onValueChange={(v) => onChange({ ...condition, field: v as FieldName, operator: getOperators(v as FieldName)[0] })}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELDS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={condition.operator} onValueChange={(v) => onChange({ ...condition, operator: v })}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {getOperators(condition.field).map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
        </SelectContent>
      </Select>
      {!condition.operator.includes('blank') && (
        <Input
          className="flex-1 h-8 text-xs min-w-[100px]"
          placeholder="value..."
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        />
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
        <X weight="bold" className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

// ─── Tab 1: HubSpot ─────────────────────────────────────────────────────────

interface HubSpotGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

function HubSpotTab() {
  const [groups, setGroups] = useState<HubSpotGroup[]>([
    { id: 'g1', operator: 'AND', conditions: [makeCondition(), makeCondition()] },
  ]);

  function addGroup() {
    setGroups([...groups, { id: genId(), operator: 'AND', conditions: [makeCondition()] }]);
  }

  function addCondition(groupId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: [...g.conditions, makeCondition()] } : g));
  }

  function removeCondition(groupId: string, condId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.filter(c => c.id !== condId) } : g));
  }

  function updateCondition(groupId: string, cond: Condition) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.map(c => c.id === cond.id ? cond : c) } : g));
  }

  function toggleGroupOperator(groupId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, operator: g.operator === 'AND' ? 'OR' : 'AND' } : g));
  }

  function removeGroup(groupId: string) {
    setGroups(groups.filter(g => g.id !== groupId));
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">HubSpot pattern:</strong> Root OR branch containing nested AND "condition groups." 
          Each group card shows its internal operator (AND/OR) and can be toggled. 
          Groups are joined by OR at the root level. Relationship filters (e.g. "has form submission") are a distinct filter type.
        </p>
      </div>

      {groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="flex items-center justify-center py-2">
              <Badge variant="warning-subtle" className="text-[10px] uppercase tracking-wider">OR</Badge>
            </div>
          )}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Group {gi + 1}</span>
                <button
                  onClick={() => toggleGroupOperator(group.id)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors",
                    group.operator === 'AND' ? "bg-primary/10 text-primary border-primary/30" : "bg-warning/10 text-warning border-warning/30"
                  )}
                >
                  {group.operator}
                </button>
              </div>
              {groups.length > 1 && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGroup(group.id)}>
                  <X weight="bold" className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2 pl-3 border-l-2 border-primary/20">
              {group.conditions.map((cond, ci) => (
                <div key={cond.id}>
                  {ci > 0 && (
                    <div className="flex items-center py-1 pl-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{group.operator}</span>
                    </div>
                  )}
                  <ConditionRow
                    condition={cond}
                    onChange={(c) => updateCondition(group.id, c)}
                    onRemove={() => removeCondition(group.id, cond.id)}
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => addCondition(group.id)}>
              <Plus weight="bold" className="h-3 w-3 mr-1" /> Add condition
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondaryOutline" size="sm" onClick={addGroup}>
        <Plus weight="bold" className="h-3.5 w-3.5 mr-1" /> Add OR group
      </Button>
    </div>
  );
}

// ─── Tab 2: Klaviyo ─────────────────────────────────────────────────────────

interface KlaviyoProperty {
  id: string;
  field: FieldName;
  operator: string;
  value: string;
}

interface KlaviyoMetric {
  id: string;
  metric: string;
  frequency: string;
  count: string;
  subFilters: Condition[];
}

interface KlaviyoCustomObject {
  id: string;
  object: string;
  recordCount: string;
  subFilters: Condition[];
}

const METRICS = ['Opened Email', 'Clicked Email', 'Placed Order', 'Viewed Product', 'Started Checkout'] as const;
const OBJECTS = ['Order', 'Subscription', 'Support Ticket', 'Appointment'] as const;

function KlaviyoTab() {
  const [properties, setProperties] = useState<KlaviyoProperty[]>([
    { id: genId(), field: 'Email', operator: 'contains', value: '' },
  ]);
  const [metrics, setMetrics] = useState<KlaviyoMetric[]>([]);
  const [customObjects, setCustomObjects] = useState<KlaviyoCustomObject[]>([]);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Klaviyo pattern:</strong> Three categories — "Properties about someone," "What someone has done," and "Custom Objects." 
          Properties are inline field→operator→value. Metrics have frequency conditions with optional nested filters. 
          Custom Objects show record count + up to 5 field sub-filters in one expandable card. All groups joined by AND.
        </p>
      </div>

      {/* Properties about someone */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Properties about someone</h3>
          <Badge variant="neutral-subtle" className="text-[10px]">AND</Badge>
        </div>
        <div className="space-y-2">
          {properties.map(prop => (
            <div key={prop.id} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
              <Select value={prop.field} onValueChange={(v) => setProperties(properties.map(p => p.id === prop.id ? { ...p, field: v as FieldName, operator: getOperators(v as FieldName)[0] } : p))}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{FIELDS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={prop.operator} onValueChange={(v) => setProperties(properties.map(p => p.id === prop.id ? { ...p, operator: v } : p))}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{getOperators(prop.field).map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}</SelectContent>
              </Select>
              {!prop.operator.includes('blank') && (
                <Input className="flex-1 h-8 text-xs" placeholder="value..." value={prop.value} onChange={(e) => setProperties(properties.map(p => p.id === prop.id ? { ...p, value: e.target.value } : p))} />
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setProperties(properties.filter(p => p.id !== prop.id))}>
                <X weight="bold" className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setProperties([...properties, { id: genId(), field: 'First Name', operator: 'equals', value: '' }])}>
          <Plus weight="bold" className="h-3 w-3 mr-1" /> Add property
        </Button>
      </div>

      {/* What someone has done */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">What someone has done</h3>
          <Badge variant="info-subtle" className="text-[10px]">Behavioural</Badge>
        </div>
        <div className="space-y-3">
          {metrics.map(m => (
            <div key={m.id} className="p-3 rounded-md border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={m.metric} onValueChange={(v) => setMetrics(metrics.map(x => x.id === m.id ? { ...x, metric: v } : x))}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{METRICS.map(mt => <SelectItem key={mt} value={mt}>{mt}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={m.frequency} onValueChange={(v) => setMetrics(metrics.map(x => x.id === m.id ? { ...x, frequency: v } : x))}>
                  <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="at least">at least</SelectItem>
                    <SelectItem value="at most">at most</SelectItem>
                    <SelectItem value="exactly">exactly</SelectItem>
                    <SelectItem value="zero times">zero times</SelectItem>
                  </SelectContent>
                </Select>
                {m.frequency !== 'zero times' && (
                  <Input className="w-[60px] h-8 text-xs" placeholder="#" value={m.count} onChange={(e) => setMetrics(metrics.map(x => x.id === m.id ? { ...x, count: e.target.value } : x))} />
                )}
                {m.frequency !== 'zero times' && <span className="text-xs text-muted-foreground">times</span>}
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={() => setMetrics(metrics.filter(x => x.id !== m.id))}>
                  <X weight="bold" className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              {/* Sub-filters */}
              {m.subFilters.length > 0 && (
                <div className="pl-4 border-l-2 border-info/30 space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Where</span>
                  {m.subFilters.map(sf => (
                    <ConditionRow key={sf.id} condition={sf}
                      onChange={(c) => setMetrics(metrics.map(x => x.id === m.id ? { ...x, subFilters: x.subFilters.map(s => s.id === c.id ? c : s) } : x))}
                      onRemove={() => setMetrics(metrics.map(x => x.id === m.id ? { ...x, subFilters: x.subFilters.filter(s => s.id !== sf.id) } : x))}
                    />
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground" onClick={() => setMetrics(metrics.map(x => x.id === m.id ? { ...x, subFilters: [...x.subFilters, makeCondition()] } : x))}>
                <Plus weight="bold" className="h-3 w-3 mr-1" /> Add where filter
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setMetrics([...metrics, { id: genId(), metric: METRICS[0], frequency: 'at least', count: '1', subFilters: [] }])}>
          <Plus weight="bold" className="h-3 w-3 mr-1" /> Add metric
        </Button>
      </div>

      {/* Custom Objects */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Custom Objects</h3>
          <Badge variant="neutral-subtle" className="text-[10px]">Records</Badge>
        </div>
        <div className="space-y-3">
          {customObjects.map(obj => (
            <div key={obj.id} className="p-3 rounded-md border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <Select value={obj.object} onValueChange={(v) => setCustomObjects(customObjects.map(x => x.id === obj.id ? { ...x, object: v } : x))}>
                  <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{OBJECTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">has</span>
                <Input className="w-[50px] h-8 text-xs" placeholder="#" value={obj.recordCount} onChange={(e) => setCustomObjects(customObjects.map(x => x.id === obj.id ? { ...x, recordCount: e.target.value } : x))} />
                <span className="text-xs text-muted-foreground">or more records where:</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={() => setCustomObjects(customObjects.filter(x => x.id !== obj.id))}>
                  <X weight="bold" className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              <div className="pl-4 border-l-2 border-border space-y-1.5">
                {obj.subFilters.map(sf => (
                  <ConditionRow key={sf.id} condition={sf}
                    onChange={(c) => setCustomObjects(customObjects.map(x => x.id === obj.id ? { ...x, subFilters: x.subFilters.map(s => s.id === c.id ? c : s) } : x))}
                    onRemove={() => setCustomObjects(customObjects.map(x => x.id === obj.id ? { ...x, subFilters: x.subFilters.filter(s => s.id !== sf.id) } : x))}
                  />
                ))}
                {obj.subFilters.length < 5 && (
                  <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground" onClick={() => setCustomObjects(customObjects.map(x => x.id === obj.id ? { ...x, subFilters: [...x.subFilters, makeCondition()] } : x))}>
                    <Plus weight="bold" className="h-3 w-3 mr-1" /> Add field filter ({5 - obj.subFilters.length} remaining)
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setCustomObjects([...customObjects, { id: genId(), object: OBJECTS[0], recordCount: '1', subFilters: [makeCondition()] }])}>
          <Plus weight="bold" className="h-3 w-3 mr-1" /> Add custom object
        </Button>
      </div>
    </div>
  );
}

// ─── Tab 3: ActiveCampaign ──────────────────────────────────────────────────

interface ACGroup {
  id: string;
  conditions: Condition[];
}

function ActiveCampaignTab() {
  const [groups, setGroups] = useState<ACGroup[]>([
    { id: 'ac-g1', conditions: [makeCondition(), makeCondition()] },
  ]);

  function addGroup() {
    setGroups([...groups, { id: genId(), conditions: [makeCondition()] }]);
  }

  function addCondition(groupId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: [...g.conditions, makeCondition()] } : g));
  }

  function removeCondition(groupId: string, condId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.filter(c => c.id !== condId) } : g));
  }

  function updateCondition(groupId: string, cond: Condition) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.map(c => c.id === cond.id ? cond : c) } : g));
  }

  function removeGroup(groupId: string) {
    setGroups(groups.filter(g => g.id !== groupId));
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">ActiveCampaign pattern:</strong> AND/OR cannot mix within one group. 
          Conditions within a group are always joined by AND. To use OR, create a second group — groups are joined by OR. 
          Tag fields collapse multiple values into one row with multi-select operators.
        </p>
      </div>

      {groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="flex items-center justify-center py-2">
              <Badge variant="warning-subtle" className="text-[10px] uppercase tracking-wider">OR</Badge>
              <span className="ml-2 text-[10px] text-muted-foreground italic">between groups</span>
            </div>
          )}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Group {gi + 1}</span>
                <Badge variant="default-subtle" className="text-[10px] uppercase tracking-wider">AND only</Badge>
              </div>
              {groups.length > 1 && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGroup(group.id)}>
                  <X weight="bold" className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2 pl-3 border-l-2 border-primary/20">
              {group.conditions.map((cond, ci) => (
                <div key={cond.id}>
                  {ci > 0 && (
                    <div className="flex items-center py-1 pl-2">
                      <span className="text-[10px] font-semibold text-primary uppercase">AND</span>
                    </div>
                  )}
                  <ConditionRow
                    condition={cond}
                    onChange={(c) => updateCondition(group.id, c)}
                    onRemove={() => removeCondition(group.id, cond.id)}
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => addCondition(group.id)}>
              <Plus weight="bold" className="h-3 w-3 mr-1" /> Add AND condition
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondaryOutline" size="sm" onClick={addGroup}>
        <Plus weight="bold" className="h-3.5 w-3.5 mr-1" /> Add OR group
      </Button>
    </div>
  );
}

// ─── Tab 4: Iterable ────────────────────────────────────────────────────────

type IterableOperator = 'All' | 'Any' | 'None';

interface IterableGroup {
  id: string;
  operator: IterableOperator;
  conditions: Condition[];
}

function IterableTab() {
  const [rootOperator, setRootOperator] = useState<IterableOperator>('All');
  const [groups, setGroups] = useState<IterableGroup[]>([
    { id: 'it-g1', operator: 'All', conditions: [makeCondition(), makeCondition()] },
  ]);
  const [showSummary, setShowSummary] = useState(false);

  function addGroup() {
    setGroups([...groups, { id: genId(), operator: 'All', conditions: [makeCondition()] }]);
  }

  function addCondition(groupId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: [...g.conditions, makeCondition()] } : g));
  }

  function removeCondition(groupId: string, condId: string) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.filter(c => c.id !== condId) } : g));
  }

  function updateCondition(groupId: string, cond: Condition) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, conditions: g.conditions.map(c => c.id === cond.id ? cond : c) } : g));
  }

  function setGroupOperator(groupId: string, op: IterableOperator) {
    setGroups(groups.map(g => g.id === groupId ? { ...g, operator: op } : g));
  }

  function removeGroup(groupId: string) {
    setGroups(groups.filter(g => g.id !== groupId));
  }

  function generateSummary(): string {
    const groupSummaries = groups.map(g => {
      const prefix = g.operator === 'None' ? 'NONE of' : g.operator === 'Any' ? 'ANY of' : 'ALL of';
      const conds = g.conditions.map(c => `${c.field} ${c.operator} ${c.value || '…'}`).join(', ');
      return `(${prefix}: ${conds})`;
    });
    const join = rootOperator === 'All' ? ' AND ' : rootOperator === 'Any' ? ' OR ' : ' AND NOT ';
    return `Match ${rootOperator === 'None' ? 'NONE' : rootOperator.toUpperCase()} of: ${groupSummaries.join(join)}`;
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Iterable pattern:</strong> Three logical operators per group — All / Any / None. 
          "None" inverts an entire group (exclusion without per-field negation). 
          Top-level also supports All/Any/None. Natural language summary generated on demand.
        </p>
      </div>

      {/* Root operator */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Root operator:</span>
        <div className="flex gap-1">
          {(['All', 'Any', 'None'] as IterableOperator[]).map(op => (
            <button
              key={op}
              onClick={() => setRootOperator(op)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-colors",
                rootOperator === op
                  ? op === 'None' ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {op}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setShowSummary(!showSummary)}>
          <ArrowsClockwise weight="bold" className="h-3 w-3 mr-1" /> {showSummary ? 'Hide' : 'Show'} summary
        </Button>
      </div>

      {showSummary && (
        <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
          <p className="text-xs text-foreground font-mono leading-relaxed">{generateSummary()}</p>
        </div>
      )}

      {groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="flex items-center justify-center py-2">
              <Badge variant={rootOperator === 'None' ? 'error-subtle' : 'default-subtle'} className="text-[10px] uppercase tracking-wider">
                {rootOperator}
              </Badge>
            </div>
          )}
          <div className={cn(
            "rounded-lg border p-4 space-y-3 relative",
            group.operator === 'None' ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Criteria Group {gi + 1}</span>
                <div className="flex gap-1">
                  {(['All', 'Any', 'None'] as IterableOperator[]).map(op => (
                    <button
                      key={op}
                      onClick={() => setGroupOperator(group.id, op)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors",
                        group.operator === op
                          ? op === 'None' ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              {groups.length > 1 && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGroup(group.id)}>
                  <X weight="bold" className="h-3 w-3" />
                </Button>
              )}
            </div>
            {group.operator === 'None' && (
              <p className="text-[10px] text-destructive italic">Excludes contacts matching all conditions below</p>
            )}
            <div className={cn(
              "space-y-2 pl-3 border-l-2",
              group.operator === 'None' ? "border-destructive/30" : "border-primary/20"
            )}>
              {group.conditions.map((cond, ci) => (
                <div key={cond.id}>
                  {ci > 0 && (
                    <div className="flex items-center py-1 pl-2">
                      <span className={cn("text-[10px] font-semibold uppercase", group.operator === 'None' ? "text-destructive" : "text-primary")}>
                        {group.operator === 'Any' ? 'OR' : 'AND'}
                      </span>
                    </div>
                  )}
                  <ConditionRow
                    condition={cond}
                    onChange={(c) => updateCondition(group.id, c)}
                    onRemove={() => removeCondition(group.id, cond.id)}
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => addCondition(group.id)}>
              <Plus weight="bold" className="h-3 w-3 mr-1" /> Add criteria
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondaryOutline" size="sm" onClick={addGroup}>
        <Plus weight="bold" className="h-3.5 w-3.5 mr-1" /> Add criteria group
      </Button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function FilterSandboxPage() {
  return (
    <PageShell
      title="Filter Builder Patterns"
      subtitle="Interactive comparison of how different platforms structure filter builders"
    >
      <Tabs defaultValue="hubspot">
        <TabsList variant="underline">
          <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
          <TabsTrigger value="klaviyo">Klaviyo</TabsTrigger>
          <TabsTrigger value="activecampaign">ActiveCampaign</TabsTrigger>
          <TabsTrigger value="iterable">Iterable</TabsTrigger>
        </TabsList>
        <TabsContent value="hubspot" className="mt-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          <HubSpotTab />
        </TabsContent>
        <TabsContent value="klaviyo" className="mt-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          <KlaviyoTab />
        </TabsContent>
        <TabsContent value="activecampaign" className="mt-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          <ActiveCampaignTab />
        </TabsContent>
        <TabsContent value="iterable" className="mt-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          <IterableTab />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
