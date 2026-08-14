import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ModuleCard
content = content.replace(
    '''      <ZenCard variant="interactive" className="h-full bg-white/5 border-white/10 hover:bg-white/10" padding="md">
        <div className={cn('w-12 h-12 rounded-zen-lg flex items-center justify-center mb-4', visual.tint)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="zen-h3 text-white mb-1">{module.title}</h3>
        <p className="zen-body-sm text-white/70">''',
    '''      <ZenCard variant="interactive" className="h-full" padding="md">
        <div className={cn('w-12 h-12 rounded-zen-lg flex items-center justify-center mb-4', visual.tint)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="zen-h3 text-zen-fg mb-1">{module.title}</h3>
        <p className="zen-body-sm text-zen-fg-muted">'''
)

# DailyFocusCard
content = content.replace(
    '''    <ZenCard variant="accent" padding="lg" className="bg-white/10 border-white/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="zen-label text-zen-primary-soft">Daily focus</p>
          <h2 className="zen-h2 text-white mt-2">{focus.title}</h2>
          <p className="zen-body text-white/80 mt-2 max-w-xl">{focus.description}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <span className="zen-metric text-white">{minutes} min</span>''',
    '''    <ZenCard variant="accent" padding="lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="zen-label text-zen-primary">Daily focus</p>
          <h2 className="zen-h2 text-zen-fg mt-2">{focus.title}</h2>
          <p className="zen-body text-zen-fg-muted mt-2 max-w-xl">{focus.description}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <span className="zen-metric text-zen-primary">{minutes} min</span>'''
)

# JournalPreview empty
content = content.replace(
    '''      <ZenCard variant="standard" className="h-full bg-white/5 border-white/10">
        <ZenCardHeader>
          <ZenCardTitle className="text-white">Recent Reflections</ZenCardTitle>
          <ZenCardDescription className="text-white/70">Your next entry awaits.</ZenCardDescription>
        </ZenCardHeader>''',
    '''      <ZenCard variant="standard" className="h-full">
        <ZenCardHeader>
          <ZenCardTitle>Recent Reflections</ZenCardTitle>
          <ZenCardDescription>Your next entry awaits.</ZenCardDescription>
        </ZenCardHeader>'''
)

# JournalPreview list
content = content.replace(
    '''    <ZenCard variant="standard" className="h-full bg-white/5 border-white/10">
      <ZenCardHeader>
        <div className="flex items-center justify-between gap-2">
          <ZenCardTitle className="text-white">Recent Reflections</ZenCardTitle>
          <Link
            href="/journal"
            className="text-sm text-zen-primary-soft hover:text-white font-medium"
          >
            Open journal
          </Link>
        </div>
      </ZenCardHeader>
      <ZenCardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-zen-lg bg-white/10 p-3">
            <p className="zen-caption text-white/50">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
            <p className="zen-body-sm text-white/90 mt-1 line-clamp-2 font-serif">{entry.content}</p>
          </div>
        ))}
      </ZenCardContent>
    </ZenCard>''',
    '''    <ZenCard variant="standard" className="h-full">
      <ZenCardHeader>
        <div className="flex items-center justify-between gap-2">
          <ZenCardTitle>Recent Reflections</ZenCardTitle>
          <Link
            href="/journal"
            className="text-sm text-zen-primary hover:text-zen-primary-hover font-medium"
          >
            Open journal
          </Link>
        </div>
      </ZenCardHeader>
      <ZenCardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-zen-lg bg-zen-bg-subtle p-3">
            <p className="zen-caption text-zen-fg-subtle">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
            <p className="zen-body-sm text-zen-fg mt-1 line-clamp-2 font-serif">{entry.content}</p>
          </div>
        ))}
      </ZenCardContent>
    </ZenCard>'''
)

# PssNudge
content = content.replace(
    '''      className={cn(
        'flex flex-wrap items-center gap-3 rounded-zen-xl px-4 py-3',
        'bg-white/10 border border-white/20 shadow-zen-subtle',
      )}
      role="status"
    >
      <ClipboardList className="h-5 w-5 text-zen-primary-soft flex-shrink-0" aria-hidden="true" />
      <p className="zen-body-sm text-white flex-1 min-w-[12rem]">''',
    '''      className={cn(
        'flex flex-wrap items-center gap-3 rounded-zen-xl px-4 py-3',
        'bg-zen-warning-soft border border-zen-warning/25 shadow-zen-subtle',
      )}
      role="status"
    >
      <ClipboardList className="h-5 w-5 text-zen-warning flex-shrink-0" aria-hidden="true" />
      <p className="zen-body-sm text-zen-fg flex-1 min-w-[12rem]">'''
)

# Welcome text
content = content.replace(
    '''            <div className="min-w-0 flex-1">
              <p className="zen-label text-zen-primary-soft">Welcome back</p>
              <h1 className="zen-h1 text-white mt-1 truncate">
                Hey {displayName}, you&apos;re safe here.
              </h1>
              <p className="zen-body-sm text-white/70 mt-2">
                Pick a practice below or follow today&apos;s focus.
              </p>
            </div>''',
    '''            <div className="min-w-0 flex-1">
              <p className="zen-label text-zen-primary">Welcome back</p>
              <h1 className="zen-h1 text-zen-fg mt-1 truncate">
                Hey {displayName}, you&apos;re safe here.
              </h1>
              <p className="zen-body-sm text-zen-fg-muted mt-2">
                Pick a practice below or follow today&apos;s focus.
              </p>
            </div>'''
)

# Empty focus state
content = content.replace(
    '''          ) : !dashboardLoading ? (
            <ZenCard variant="subtle" className="text-center border-dashed border-white/30 bg-white/5">
              <p className="zen-body text-white/90">
                Set your intention anytime — choose a practice while we line up a fresh daily focus.
              </p>
            </ZenCard>''',
    '''          ) : !dashboardLoading ? (
            <ZenCard variant="subtle" className="text-center border-dashed border-zen-primary/30">
              <p className="zen-body text-zen-primary">
                Set your intention anytime — choose a practice while we line up a fresh daily focus.
              </p>
            </ZenCard>'''
)

# Empty next pss card
content = content.replace(
    '''              ) : (
                <ZenCard variant="standard" className="h-full flex items-center justify-center bg-white/5 border-white/10">
                  <p className="zen-body-sm text-white/70 text-center py-3">
                    Next stress check-in in {daysNextPSS} day{daysNextPSS === 1 ? '' : 's'}
                  </p>
                </ZenCard>
              )}''',
    '''              ) : (
                <ZenCard variant="standard" className="h-full flex items-center justify-center">
                  <p className="zen-body-sm text-zen-fg-muted text-center py-3">
                    Next stress check-in in {daysNextPSS} day{daysNextPSS === 1 ? '' : 's'}
                  </p>
                </ZenCard>
              )}'''
)

# Wellness Space header
content = content.replace(
    '''<h2 className="zen-h2 text-white text-center mb-8">Your Wellness Space</h2>''',
    '''<h2 className="zen-h2 text-zen-fg text-center mb-8">Your Wellness Space</h2>'''
)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
