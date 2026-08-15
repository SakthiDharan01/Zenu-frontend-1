import os

file_path = "src/app/art/page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Fix the back button - remove 'glass-floating' and make it dark glass
    "glass-floating shadow-zen-floating text-sm font-medium text-white hover:bg-white/95": "bg-black/20 backdrop-blur-md border border-white/10 shadow-zen-floating text-sm font-medium text-white hover:bg-black/40",
    
    # Fix the sidebar panels - remove 'glass' and make them dark glass
    "className=\"glass rounded-zen-xl p-3 shadow-zen-subtle\"": "className=\"bg-black/20 backdrop-blur-xl border border-white/10 rounded-zen-xl p-3 shadow-zen-subtle\"",
    "className=\"glass rounded-zen-xl p-3 space-y-3 shadow-zen-subtle\"": "className=\"bg-black/20 backdrop-blur-xl border border-white/10 rounded-zen-xl p-3 space-y-3 shadow-zen-subtle\"",
    "className=\"glass rounded-zen-xl p-3 space-y-2 shadow-zen-subtle\"": "className=\"bg-black/20 backdrop-blur-xl border border-white/10 rounded-zen-xl p-3 space-y-2 shadow-zen-subtle\"",
    
    # Fix the 'bg-white/10' buttons in the actions block which might still be too faint if the user wants them more prominent.
    # User said "options tools and stuff like still its more transparent right" - they might want the tools to be more solid or have a better border.
    # Let's make the tool buttons and action buttons slightly more visible.
    "bg-white/10 hover:bg-white/20": "bg-white/15 hover:bg-white/25",
    "border-white/20 hover:border-white/50": "border-white/30 hover:border-white/60",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix applied successfully.")
