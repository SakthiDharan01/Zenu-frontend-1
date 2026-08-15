import os

file_path = "src/app/art/page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # 1. Back button position
    "fixed top-20 left-4": "absolute top-6 left-6 lg:left-8",
    
    # 2. General text colors
    "text-zen-fg-muted": "text-white/70",
    "text-zen-fg": "text-white",
    
    # 3. Label text colors
    "text-foreground/80": "text-white/80",
    "text-muted-foreground": "text-white/60",
    
    # 4. Backgrounds
    "bg-muted/30": "bg-white/10",
    
    # 5. Tool button default states (border and hover text)
    "border-zen-border hover:border-zen-primary hover:text-zen-primary": "border-white/20 hover:border-white/50 text-white/80 hover:text-white",
    
    # 6. Action buttons (Undo/Redo/Clear)
    "bg-zen-bg-muted hover:bg-zen-bg-subtle": "bg-white/10 hover:bg-white/20 text-white",
    
    # 7. Borders
    "border-border/50": "border-white/20",
    "border-zen-border-soft": "border-white/20",
    
    # 8. Tip section
    "bg-zen-primary-soft": "bg-white/10",
    "border-zen-primary/20": "border-white/20",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully.")
