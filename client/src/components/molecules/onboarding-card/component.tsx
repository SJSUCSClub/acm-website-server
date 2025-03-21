import React from 'react';
import Card, {
  CardTitle,
  CardContent,
  CardHeader,
  ICardProps,
  CardDescription,
} from '../../atoms/card';

export interface IOnboardingCardProps extends ICardProps {
  subtitle?: string;
  header: React.ReactNode;
  image?: string;
  children: React.ReactNode;
  className?: string;
}

export const OnboardingCard: React.FC<IOnboardingCardProps> = ({
  header,
  subtitle = '',
  image = '',
  children,
  className,
}) => (
  <Card className={className}>
    <CardHeader className="text-center">
      <div className="flex justify-center pb-6">
        {image !== '' && <img src={image} alt={subtitle} />}
      </div>
      <CardTitle>{header}</CardTitle>
      <CardDescription className="text-[16px]">{subtitle}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
