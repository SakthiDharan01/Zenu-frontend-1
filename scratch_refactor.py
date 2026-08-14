import os
import re

files_to_themes = {
    'src/app/breathing/page.tsx': 'breathing',
    'src/app/meditation/page.tsx': 'mindfulness',
    'src/app/gratitude/page.tsx': 'gratitude',
    'src/app/journal/page.tsx': 'diary',
    'src/app/art/page.tsx': 'doodle',
    'src/app/bubbles/page.tsx': 'bubble',
    'src/app/burst/page.tsx': 'burst',
    'src/app/scribble/page.tsx': 'scribble',
    'src/app/chat/page.tsx': 'chat',
    'src/app/healing-garden/page.tsx': 'healing-garden',
    'src/app/innercompass/page.tsx': 'inner-compass'
}

for filepath, theme_key in files_to_themes.items():
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist.")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports
    if "import ModulePage" not in content:
        # Find the last import
        last_import_match = list(re.finditer(r'^import .*;$', content, flags=re.MULTILINE))
        if last_import_match:
            last_import = last_import_match[-1]
            insert_pos = last_import.end()
            new_imports = f"\nimport ModulePage from '@/components/ui/ModulePage';\nimport {{ getTheme }} from '@/lib/moduleThemes';\n"
            content = content[:insert_pos] + new_imports + content[insert_pos:]
        else:
            new_imports = f"import ModulePage from '@/components/ui/ModulePage';\nimport {{ getTheme }} from '@/lib/moduleThemes';\n"
            content = new_imports + content

    # Add theme const before return
    # This is tricky because we need to find the default export or the main return.
    # Usually it's inside `export default function Page()`
    # Let's try to find `return (` or `return <ZenPage`
    
    # We can replace `<ZenPage` with `<ModulePage theme={theme}><ZenPage atmosphere="none"`
    # But wait, not all pages use ZenPage.
    
    print(f"File: {filepath} needs manual check or more advanced regex.")

