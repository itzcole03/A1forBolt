import { defaultFallbackInView } from 'react-intersection-observer';



// `react-intersection-observer/test-utils` added in
// `setupFilesAfterEnv` will add a mock `IntersectionObserver`
// automatically in every `beforeEach()`. But `next/link`
// checks to see if `IntersectionObserver` exists at module
// scope. So we add the bare minimum to get that check to pass.
global.IntersectionObserver = jest.fn();

// Then when the tests actually run, we default intersection to
// `false` so that `jest-axe` assertions will pass without needing
// `act()`.
defaultFallbackInView(false); 