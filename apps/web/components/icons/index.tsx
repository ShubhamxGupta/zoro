import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof LucideIcons;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 16, color, strokeWidth = 1.5, ...props }) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps> | undefined;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle size={size} color={color} strokeWidth={strokeWidth} />;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} {...props} />;
};

export * from 'lucide-react';
