## Problem
When uploading a large video with presigned url, it takes a long time to upload and the user may not know if the upload is in progress or not.

Please implement progress indicator for video upload.

Use shadcn/ui.

```
npx shadcn@latest add progress
```

### Usage
```
import { Progress } from "@/components/ui/progress"
<Progress value={33} />
```

