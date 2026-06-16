import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

// Register the jest-axe matcher for WCAG 2.1 AA accessibility assertions (SC-005).
expect.extend(toHaveNoViolations);
