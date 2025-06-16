const fs = require('fs');
const path = require('path');

// List of test files to update
const testFiles = [
  'src/nodes/__tests__/NatsObjectStore.test.ts',
  'src/nodes/__tests__/NatsObjectStoreTrigger.test.ts',
  'src/nodes/__tests__/NatsTrigger.test.ts',
  'src/nodes/__tests__/NatsPublisher.test.ts',
  'src/nodes/__tests__/NatsRequestReply.test.ts',
  'src/nodes/__tests__/NatsService.test.ts',
  'src/nodes/__tests__/NatsServiceReply.test.ts',
];

testFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;
  
  // Add mock for bundled module if not present
  if (!content.includes("jest.mock('../../bundled/nats-bundled'")) {
    const mockIndex = content.indexOf("jest.mock('../../utils/NatsConnection');");
    if (mockIndex !== -1) {
      const insertPos = mockIndex + "jest.mock('../../utils/NatsConnection');".length;
      content = content.slice(0, insertPos) + 
        "\njest.mock('../../bundled/nats-bundled', () => ({\n" +
        "\tjetstream: jest.fn(),\n" +
        "\tjetstreamManager: jest.fn(),\n" +
        "\tKvm: jest.fn(),\n" +
        "\tObjm: jest.fn(),\n" +
        "\tconsumerOpts: jest.fn(() => ({\n" +
        "\t\tdeliverAll: jest.fn().mockReturnThis(),\n" +
        "\t\tdeliverNew: jest.fn().mockReturnThis(),\n" +
        "\t\tdeliverLast: jest.fn().mockReturnThis(),\n" +
        "\t\tdeliverLastPerSubject: jest.fn().mockReturnThis(),\n" +
        "\t\tackExplicit: jest.fn().mockReturnThis(),\n" +
        "\t\tmanualAck: jest.fn().mockReturnThis(),\n" +
        "\t\tbind: jest.fn().mockReturnThis(),\n" +
        "\t\tbuild: jest.fn().mockReturnValue({}),\n" +
        "\t})),\n" +
        "\tStringCodec: jest.fn(() => ({\n" +
        "\t\tencode: jest.fn((str) => new TextEncoder().encode(str)),\n" +
        "\t\tdecode: jest.fn((data) => new TextDecoder().decode(data)),\n" +
        "\t})),\n" +
        "\tEmpty: new Uint8Array(0),\n" +
        "\tcreateInbox: jest.fn(() => '_INBOX.test'),\n" +
        "\theaders: jest.fn(() => ({\n" +
        "\t\tappend: jest.fn(),\n" +
        "\t\tset: jest.fn(),\n" +
        "\t\tget: jest.fn(),\n" +
        "\t})),\n" +
        "}));" +
        content.slice(insertPos);
      updated = true;
    }
  }
  
  // Add imports if needed
  const importsMatch = content.match(/import.*from.*n8n-workflow.*;/);
  if (importsMatch && !content.includes("from '../../bundled/nats-bundled'")) {
    const importPos = importsMatch.index + importsMatch[0].length;
    const requiredImports = [];
    
    if (file.includes('Kv')) {
      requiredImports.push('jetstream', 'Kvm');
    }
    if (file.includes('ObjectStore')) {
      requiredImports.push('jetstream', 'Objm');
      if (!file.includes('Kv')) {
        requiredImports.push('jetstreamManager');
      }
    }
    if (file.includes('Trigger')) {
      requiredImports.push('consumerOpts');
    }
    if (file.includes('Publisher') || file.includes('RequestReply') || file.includes('Service')) {
      requiredImports.push('StringCodec', 'Empty', 'createInbox', 'headers');
      if (!requiredImports.includes('jetstream')) {
        requiredImports.push('jetstream');
      }
    }
    
    if (requiredImports.length > 0) {
      content = content.slice(0, importPos) + 
        `\nimport { ${requiredImports.join(', ')} } from '../../bundled/nats-bundled';` +
        content.slice(importPos);
      updated = true;
    }
  }
  
  // Update nc.jetstream() to jetstream(nc)
  if (content.includes('mockNc.jetstream')) {
    content = content.replace(/mockNc\.jetstream\(\)\.mockReturnValue\(mockJs\)/g, 
      'jetstream as jest.Mock).mockReturnValue(mockJs');
    
    // Remove jetstream from mockNc
    content = content.replace(/jetstream: jest\.fn\(\)\.mockReturnValue\(mockJs\),?\n\s*/g, '');
    
    updated = true;
  }
  
  // Update js.views.kv/os patterns
  if (content.includes('js.views.kv') || content.includes('js.views.os')) {
    // Add manager mocks
    const beforeEachMatch = content.match(/beforeEach\(\(\) => \{[\s\S]*?jest\.clearAllMocks\(\);/);
    if (beforeEachMatch) {
      const insertPos = beforeEachMatch.index + beforeEachMatch[0].length;
      
      if (file.includes('Kv')) {
        content = content.slice(0, insertPos) + 
          '\n\t\tlet mockKvManager: any;' +
          content.slice(insertPos);
      }
      if (file.includes('ObjectStore')) {
        content = content.slice(0, insertPos) + 
          '\n\t\tlet mockObjManager: any;' +
          content.slice(insertPos);
      }
    }
    
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No updates needed for ${file}`);
  }
});

console.log('Test update complete!');