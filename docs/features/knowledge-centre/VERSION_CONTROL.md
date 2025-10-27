# Documentation Version Control

## Overview

The Knowledge Centre includes automatic version control for all documentation changes.

## Features

### Automatic Versioning
- Every edit creates new version
- Version number auto-increments
- Full content snapshot saved
- Author and timestamp recorded

### Version History
- View all previous versions
- Compare versions side-by-side
- Restore any previous version
- Export version history

## Database Schema

```sql
CREATE TABLE documentation_versions (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documentation(id),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(user_id),
  change_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Restoring Versions

1. Open document in Knowledge Centre
2. Click "Version History"
3. Select version to restore
4. Click "Restore This Version"
5. Confirm restoration

## Best Practices

- Write clear change summaries
- Review changes before publishing
- Keep version history clean
- Document major changes

## Related Documentation
- [Knowledge Centre](KNOWLEDGE_CENTRE.md)
- [Admin Platform Guide](../../admin/PLATFORM_GUIDE.md)
