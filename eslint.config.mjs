import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vite.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Layering: ui cannot reach into core/api directly — it must go
            // through components (ui + core/api composition). Keeps ui-web
            // presentational and reusable without business logic baked in.
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:types'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:core',
                'type:api',
                'type:util',
                'type:types',
              ],
            },
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:util',
                'type:types',
              ],
            },
            {
              sourceTag: 'type:api',
              onlyDependOnLibsWithTags: [
                'type:api',
                'type:core',
                'type:util',
                'type:types',
              ],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util', 'type:types'],
            },
            {
              sourceTag: 'type:types',
              onlyDependOnLibsWithTags: ['type:types'],
            },
            // Platform boundary: web-only libs (ui-web, components-web) can
            // never be pulled into a future native/mobile project, and vice
            // versa. platform:agnostic libs (core/api/types/utils) are safe
            // for either side to depend on — both are React (web + native),
            // so core may contain React code (context providers, etc.);
            // it just can't touch the DOM or a specific renderer directly.
            {
              sourceTag: 'platform:web',
              onlyDependOnLibsWithTags: ['platform:web', 'platform:agnostic'],
            },
            {
              sourceTag: 'platform:native',
              onlyDependOnLibsWithTags: [
                'platform:native',
                'platform:agnostic',
              ],
            },
            {
              sourceTag: 'platform:agnostic',
              onlyDependOnLibsWithTags: ['platform:agnostic'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
