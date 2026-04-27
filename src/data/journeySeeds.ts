// src/data/journeySeeds.ts

import type { JourneyDefinition } from '../models/journey';

/**
 * Welcome Journey — 8 nodes
 * trigger → email → wait 2d → if/else (opened?) → follow-up email (yes) → wait 5d → offer email → exit
 */
const welcomeJourney: JourneyDefinition = {
  id: 'jrn-welcome-akl',
  name: 'Auckland Welcome Journey',
  campaignId: 'cmp-welcome-series',
  accountId: 'acc-auckland',
  status: 'active',
  nodeCount: 8,
  entryCount: 5,
  type: 'welcome',

  nodes: [
    {
      id: 'w-n1',
      type: 'trigger',
      subType: 'segment-entry',
      position: { x: 300, y: 50 },
      label: 'New Members',
      config: { subType: 'segment-entry', segmentId: 'seg-new' },
    },
    {
      id: 'w-n2',
      type: 'action',
      subType: 'send-email',
      position: { x: 300, y: 200 },
      label: 'Send Welcome Email',
      config: { subType: 'send-email', emailRef: 'Welcome Email', emailContent: '' },
    },
    {
      id: 'w-n3',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 300, y: 350 },
      label: 'Wait 2 Days',
      config: { subType: 'time-delay', duration: 2, unit: 'days' },
    },
    {
      id: 'w-n4',
      type: 'branch',
      subType: 'if-else',
      position: { x: 300, y: 500 },
      label: 'Opened Email?',
      config: {
        subType: 'if-else',
        condition: {
          combinator: 'AND',
          rules: [{ field: 'emailOpened', operator: 'equals', value: 'true' }],
          groups: [],
        },
      },
    },
    {
      id: 'w-n5',
      type: 'action',
      subType: 'send-email',
      position: { x: 150, y: 650 },
      label: 'Send Follow-up Email',
      config: { subType: 'send-email', emailRef: 'Follow-up Email', emailContent: '' },
    },
    {
      id: 'w-n6',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 150, y: 800 },
      label: 'Wait 5 Days',
      config: { subType: 'time-delay', duration: 5, unit: 'days' },
    },
    {
      id: 'w-n7',
      type: 'action',
      subType: 'send-email',
      position: { x: 150, y: 950 },
      label: 'Send Offer Email',
      config: { subType: 'send-email', emailRef: 'Special Offer Email', emailContent: '' },
    },
    {
      id: 'w-n8',
      type: 'end',
      subType: 'exit',
      position: { x: 300, y: 1100 },
      label: 'Exit Journey',
      config: { subType: 'exit', label: 'Journey Complete', reason: 'completed' },
    },
  ],

  edges: [
    { id: 'w-e1', sourceNodeId: 'w-n1', targetNodeId: 'w-n2', sourceHandle: 'default' },
    { id: 'w-e2', sourceNodeId: 'w-n2', targetNodeId: 'w-n3', sourceHandle: 'default' },
    { id: 'w-e3', sourceNodeId: 'w-n3', targetNodeId: 'w-n4', sourceHandle: 'default' },
    { id: 'w-e4', sourceNodeId: 'w-n4', targetNodeId: 'w-n5', sourceHandle: 'yes', label: 'Yes' },
    { id: 'w-e5', sourceNodeId: 'w-n4', targetNodeId: 'w-n8', sourceHandle: 'no', label: 'No' },
    { id: 'w-e6', sourceNodeId: 'w-n5', targetNodeId: 'w-n6', sourceHandle: 'default' },
    { id: 'w-e7', sourceNodeId: 'w-n6', targetNodeId: 'w-n7', sourceHandle: 'default' },
    { id: 'w-e8', sourceNodeId: 'w-n7', targetNodeId: 'w-n8', sourceHandle: 'default' },
  ],

  settings: {
    name: 'Auckland Welcome Journey',
    description: 'Onboard new Auckland members with a personalised welcome series',
    journeyType: 'welcome',
    entryCriteria: { segmentId: 'seg-new' },
    reEntryRule: 'block',
    status: 'active',
  },
};


/**
 * Re-engagement Journey — 6 nodes
 * trigger (inactive 90+) → email → wait 7d → if/else (clicked?) → discount offer (yes) → exit (no)
 */
const reEngagementJourney: JourneyDefinition = {
  id: 'jrn-reeng-akl',
  name: 'Auckland Re-engagement',
  campaignId: 'cmp-win-back',
  accountId: 'acc-auckland',
  status: 'completed',
  nodeCount: 6,
  entryCount: 4,
  type: 're-engagement',

  nodes: [
    {
      id: 'r-n1',
      type: 'trigger',
      subType: 'segment-entry',
      position: { x: 300, y: 50 },
      label: 'Inactive 90+ Days',
      config: { subType: 'segment-entry', segmentId: 'seg-risk' },
    },
    {
      id: 'r-n2',
      type: 'action',
      subType: 'send-email',
      position: { x: 300, y: 200 },
      label: 'Send We Miss You Email',
      config: { subType: 'send-email', emailRef: 'We Miss You Email', emailContent: '' },
    },
    {
      id: 'r-n3',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 300, y: 350 },
      label: 'Wait 7 Days',
      config: { subType: 'time-delay', duration: 7, unit: 'days' },
    },
    {
      id: 'r-n4',
      type: 'branch',
      subType: 'if-else',
      position: { x: 300, y: 500 },
      label: 'Clicked Link?',
      config: {
        subType: 'if-else',
        condition: {
          combinator: 'AND',
          rules: [{ field: 'linkClicked', operator: 'equals', value: 'true' }],
          groups: [],
        },
      },
    },
    {
      id: 'r-n5',
      type: 'action',
      subType: 'send-email',
      position: { x: 150, y: 650 },
      label: 'Send Discount Offer',
      config: { subType: 'send-email', emailRef: 'Discount Offer Email', emailContent: '' },
    },
    {
      id: 'r-n6',
      type: 'end',
      subType: 'exit',
      position: { x: 450, y: 650 },
      label: 'Exit Journey',
      config: { subType: 'exit', label: 'Journey Complete', reason: 'completed' },
    },
  ],

  edges: [
    { id: 'r-e1', sourceNodeId: 'r-n1', targetNodeId: 'r-n2', sourceHandle: 'default' },
    { id: 'r-e2', sourceNodeId: 'r-n2', targetNodeId: 'r-n3', sourceHandle: 'default' },
    { id: 'r-e3', sourceNodeId: 'r-n3', targetNodeId: 'r-n4', sourceHandle: 'default' },
    { id: 'r-e4', sourceNodeId: 'r-n4', targetNodeId: 'r-n5', sourceHandle: 'yes', label: 'Yes' },
    { id: 'r-e5', sourceNodeId: 'r-n4', targetNodeId: 'r-n6', sourceHandle: 'no', label: 'No' },
    { id: 'r-e6', sourceNodeId: 'r-n5', targetNodeId: 'r-n6', sourceHandle: 'default' },
  ],

  settings: {
    name: 'Auckland Re-engagement',
    description: 'Re-engage lapsed Auckland members who haven\'t visited in 90+ days',
    journeyType: 're-engagement',
    entryCriteria: { segmentId: 'seg-risk' },
    reEntryRule: 'delay',
    status: 'completed',
  },
};


/**
 * Post-Purchase Follow-up — 8 nodes
 * event trigger (purchase) → wait 1d → thank you email → wait 14d → review request →
 * A/B split → upsell email (A) / survey (B) → exit
 */
const postPurchaseJourney: JourneyDefinition = {
  id: 'jrn-promo-summer',
  name: 'Summer Specials Promo',
  campaignId: 'cmp-summer-glow',
  accountId: 'acc-master',
  status: 'active',
  nodeCount: 8,
  entryCount: 34,
  type: 'promotional',

  nodes: [
    {
      id: 'p-n1',
      type: 'trigger',
      subType: 'event-based',
      position: { x: 300, y: 50 },
      label: 'Purchase Made',
      config: { subType: 'event-based', eventType: 'purchase_made' },
    },
    {
      id: 'p-n2',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 300, y: 200 },
      label: 'Wait 1 Day',
      config: { subType: 'time-delay', duration: 1, unit: 'days' },
    },
    {
      id: 'p-n3',
      type: 'action',
      subType: 'send-email',
      position: { x: 300, y: 350 },
      label: 'Send Thank You Email',
      config: { subType: 'send-email', emailRef: 'Thank You Email', emailContent: '' },
    },
    {
      id: 'p-n4',
      type: 'wait',
      subType: 'time-delay',
      position: { x: 300, y: 500 },
      label: 'Wait 14 Days',
      config: { subType: 'time-delay', duration: 14, unit: 'days' },
    },
    {
      id: 'p-n5',
      type: 'action',
      subType: 'send-email',
      position: { x: 300, y: 650 },
      label: 'Send Review Request',
      config: { subType: 'send-email', emailRef: 'Review Request Email', emailContent: '' },
    },
    {
      id: 'p-n6',
      type: 'branch',
      subType: 'ab-split',
      position: { x: 300, y: 800 },
      label: 'A/B Split',
      config: { subType: 'ab-split', variantAPercent: 50 },
    },
    {
      id: 'p-n7',
      type: 'action',
      subType: 'send-email',
      position: { x: 150, y: 950 },
      label: 'Send Upsell Email',
      config: { subType: 'send-email', emailRef: 'Upsell Email', emailContent: '' },
    },
    {
      id: 'p-n8',
      type: 'action',
      subType: 'send-email',
      position: { x: 450, y: 950 },
      label: 'Send Survey',
      config: { subType: 'send-email', emailRef: 'Customer Survey', emailContent: '' },
    },
  ],

  edges: [
    { id: 'p-e1', sourceNodeId: 'p-n1', targetNodeId: 'p-n2', sourceHandle: 'default' },
    { id: 'p-e2', sourceNodeId: 'p-n2', targetNodeId: 'p-n3', sourceHandle: 'default' },
    { id: 'p-e3', sourceNodeId: 'p-n3', targetNodeId: 'p-n4', sourceHandle: 'default' },
    { id: 'p-e4', sourceNodeId: 'p-n4', targetNodeId: 'p-n5', sourceHandle: 'default' },
    { id: 'p-e5', sourceNodeId: 'p-n5', targetNodeId: 'p-n6', sourceHandle: 'default' },
    { id: 'p-e6', sourceNodeId: 'p-n6', targetNodeId: 'p-n7', sourceHandle: 'variant-a', label: 'Variant A' },
    { id: 'p-e7', sourceNodeId: 'p-n6', targetNodeId: 'p-n8', sourceHandle: 'variant-b', label: 'Variant B' },
  ],

  settings: {
    name: 'Summer Specials Promo',
    description: 'Post-purchase follow-up with thank you, review request, and A/B tested upsell',
    journeyType: 'promotional',
    entryCriteria: { segmentId: 'seg-gold' },
    reEntryRule: 'allow',
    status: 'active',
  },
};

/** All sample journey definitions */
export const journeyDefinitions: JourneyDefinition[] = [
  welcomeJourney,
  reEngagementJourney,
  postPurchaseJourney,
];
