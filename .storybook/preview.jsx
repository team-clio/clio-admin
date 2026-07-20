import '../src/index.css'

const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['Design System', ['Introduction', 'Tokens'], 'Atoms', 'Organisms', 'Pages'],
      },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#f5f6f8' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
}

export default preview
