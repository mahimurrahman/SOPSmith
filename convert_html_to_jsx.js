const fs = require('fs');
const path = require('path');

function convertHtmlToJsx(html) {
  let jsx = html.replace(/class="/g, 'className="');
  jsx = jsx.replace(/for="/g, 'htmlFor="');
  jsx = jsx.replace(/viewbox="/ig, 'viewBox="');
  jsx = jsx.replace(/stroke-width="/ig, 'strokeWidth="');
  jsx = jsx.replace(/stroke-linecap="/ig, 'strokeLinecap="');
  jsx = jsx.replace(/stroke-linejoin="/ig, 'strokeLinejoin="');
  jsx = jsx.replace(/fill-rule="/ig, 'fillRule="');
  jsx = jsx.replace(/clip-rule="/ig, 'clipRule="');
  jsx = jsx.replace(/tabindex="/ig, 'tabIndex="');
  
  // Clean up inline styles that conflict with React (like style="width: 75%")
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
      // Very basic conversion of `width: 75%` to `style={{ width: '75%' }}`
      const styleObj = p1.split(';').filter(Boolean).map(s => {
          const [key, val] = s.split(':');
          if (!key || !val) return '';
          const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
          return `${camelKey}: '${val.trim()}'`;
      }).join(', ');
      return `style={{ ${styleObj} }}`;
  });

  // Close unclosed elements
  jsx = jsx.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
  jsx = jsx.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
  jsx = jsx.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
  jsx = jsx.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');
  
  // HTML comments to JSX comments
  jsx = jsx.replace(/<!--(.*?)-->/gs, '{/* $1 */}');
  
  return jsx;
}

const mappings = [
  { file: '2_Marketing_Landing_Page.html', out: 'app/page.tsx', name: 'MarketingLandingPage' },
  { file: '5_Auth_Login_Page.html', out: 'app/login/page.tsx', name: 'LoginPage' },
  { file: '4_SOP_Library_Dashboard.html', out: 'app/dashboard/page.tsx', name: 'DashboardPage' },
  { file: '6_Create_New_SOP_Flow.html', out: 'app/dashboard/sop/create/page.tsx', name: 'CreateSOPPage' },
  { file: '1_SOP_Detailed_View.html', out: 'app/dashboard/sop/[id]/page.tsx', name: 'SOPDetailedViewPage' },
  { file: '3_System_States_And_Error_Views.html', out: 'app/system-states/page.tsx', name: 'SystemStatesPage' } // Storing here instead of directly as global-error.tsx to avoid boundary props issues initially
];

mappings.forEach(mapping => {
  const inPath = path.join('stitch_screens', mapping.file);
  const outPath = path.join(mapping.out);
  
  if (!fs.existsSync(inPath)) {
    console.error(`Missing input file: ${inPath}`);
    return;
  }
  
  const html = fs.readFileSync(inPath, 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  let bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  const jsxContent = convertHtmlToJsx(bodyContent);
  
  const componentTemplate = `
// Auto-generated from Stitch HTML
export default function ${mapping.name}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, componentTemplate);
  console.log(`Converted ${mapping.file} -> ${outPath}`);
});
