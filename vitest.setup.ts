import '@testing-library/jest-dom'

// framer-motion の whileInView が使う IntersectionObserver を jsdom でモック
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver
