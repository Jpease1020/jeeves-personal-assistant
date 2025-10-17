import React from 'react';
import { Container } from '../../layout/containers/Container';
import { Text } from './text/Text';
import { H3 } from './text/Headings';
import { Stack } from '../../layout/framing/Stack';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  variant?: 'default' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'info';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  variant = 'default',
  size = 'md',
  // color = 'primary'
}) => {
  const progress = (currentStep / totalSteps) * 100;

  if (variant === 'minimal') {
    return (
      <Container variant="default" padding={size}>
        <Stack direction="vertical" spacing="sm">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text size="sm">
              Step {currentStep} of {totalSteps}
            </Text>
            <Text size="sm">
              {Math.round(progress)}%
            </Text>
          </Stack>
          <Container variant="default" padding="none">
            <Container variant="elevated" padding="none">
              <Text size="xs">
                {Math.round(progress)}%
              </Text>
            </Container>
          </Container>
        </Stack>
      </Container>
    );
  }

  if (variant === 'detailed') {
    return (
      <Container variant="default" padding={size}>
        <Stack direction="vertical" spacing="md">
          <Stack direction="horizontal" justify="space-between" align="center">
            <H3 size={size}>
              {steps[currentStep - 1]}
            </H3>
            <Text size="sm">
              {currentStep} of {totalSteps}
            </Text>
          </Stack>

          <Stack direction="vertical" spacing="sm">
            <Container variant="default" padding="none">
              <Container variant="elevated" padding="none">
                <Text size="xs">
                  {Math.round(progress)}%
                </Text>
              </Container>
            </Container>

            <Stack direction="horizontal" spacing="sm">
              {steps.map((_, index) => (
                <Container key={index} variant="default" padding="xs">
                  <Text size="xs">
                    {index + 1}
                  </Text>
                </Container>
              ))}
            </Stack>
          </Stack>

          <Stack direction="vertical" spacing="xs">
            {steps.map((step, index) => (
              <Container key={index} variant="default" padding="xs">
                <Text size="sm">
                  {step}
                </Text>
              </Container>
            ))}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // Default variant
  return (
    <Container variant="default" padding={size}>
      <Stack direction="vertical" spacing="sm">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text size="sm">
            {steps[currentStep - 1]}
          </Text>
          <Text size="sm">
            {currentStep} of {totalSteps}
          </Text>
        </Stack>

        <Container variant="default" padding="none">
          <Container variant="elevated" padding="none">
            <Text size="xs">
              {Math.round(progress)}%
            </Text>
          </Container>
        </Container>
      </Stack>
    </Container>
  );
};

export { ProgressIndicator }; 