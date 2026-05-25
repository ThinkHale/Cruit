import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts'],
  },
  ...nextVitals,
];

export default eslintConfig;
