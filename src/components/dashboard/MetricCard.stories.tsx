// src/components/dashboard/MetricCard.stories.tsx
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard.tsx';
import { DollarSign, Cpu, AlertTriangle } from 'lucide-react';

// 1. Meta configuration defines the component in the Storybook sidebar
const meta = {
  title: 'Design System/Dashboard/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered', // Centers the component in the Storybook canvas
  },
  tags: ['autodocs'], // Auto-generates documentation!
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. Story 1: The Default State (e.g., Active Resources)
export const Default: Story = {
  args: {
    title: 'Active Resources',
    value: '142',
    subtitle: 'Compute & Database instances',
    icon: Cpu,
    delay: 0, // Remove animation delay for testing
  },
};

// 3. Story 2: A Positive Financial Trend (Green)
export const PositiveTrend: Story = {
  args: {
    title: 'Total 30-Day Spend',
    value: '$12,450.00',
    icon: DollarSign,
    trend: 'down',
    trendValue: '-5% from last week', // In FinOps, spending less is a "down" trend but a Positive outcome!
    delay: 0,
  },
};

// 4. Story 3: A Critical Alert State (Red)
export const CriticalAnomaly: Story = {
  args: {
    title: 'Critical Anomalies',
    value: '3',
    icon: AlertTriangle,
    trend: 'up',
    trendValue: 'Immediate Action Required',
    delay: 0,
  },
  // We can even wrap the story in a specific width to see how it acts in a tight grid
  decorators: [
    ((StoryComponent) => (
      <div style={{ width: '300px' }}>
        <StoryComponent />
      </div>
    )) satisfies Decorator<typeof MetricCard>,
  ],
};