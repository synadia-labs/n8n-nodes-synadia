const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.spec.ts', 'dist/**/*', 'src/index.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'n8n-nodes-base': n8nNodesBase,
    },
    rules: {
      // Apply n8n community rules (for package.json validation)
      ...n8nNodesBase.configs.community.rules,
      
      // Apply n8n node-specific rules
      ...n8nNodesBase.configs.nodes.rules,
      
      // Apply n8n credential rules
      ...n8nNodesBase.configs.credentials.rules,
      
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off', // We need any for dynamic N8N data
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|NodeConnectionType'
      }],
      
      // Override some rules for our use case
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // Use TypeScript's version
      
      // Disable N8N rules that conflict with our setup
      'n8n-nodes-base/community-package-json-license-not-default': 'off', // We use MIT
      'n8n-nodes-base/node-dirname-against-convention': 'off', // Our structure is fine
      'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off', // TypeScript requires NodeConnectionType
      'n8n-nodes-base/node-class-description-outputs-wrong': 'off', // TypeScript requires NodeConnectionType
      'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off', // Our URL is fine
      'n8n-nodes-base/cred-class-field-documentation-url-not-http-url': 'off', // Docs URL is fine
      'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off', // Our ordering is logical
      
      // Keep default for error handling
      'n8n-nodes-base/node-execute-block-wrong-error-thrown': 'error',
    },
  },
  {
    // Special rules for node method signatures
    files: ['src/nodes/**/*.node.ts'],
    rules: {
      // Disable unused vars check for 'this' in execute/trigger methods
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^this$'
      }],
    },
  },
];