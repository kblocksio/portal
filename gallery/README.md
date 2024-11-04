# Kblocks Gallery

This repository includes a gallery of useful kblocks for building cloud platforms and rocking it.

You can find them all under the [`kblocks`](./kblocks/) directory.

## Installation

You can install all of the kblocks in this repository to your cluster.

Install deps:

```sh
npm i
```

You will need the following environment variables:

```sh
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
GITHUB_TOKEN
TF_BACKEND_REGION
TF_BACKEND_BUCKET
TF_BACKEND_DYNAMODB
TF_BACKEND_KEY
KBLOCKS_SLACK_CHANNEL
SLACK_API_TOKEN
OPENAI_API_KEY
```

Now, you are ready!

```sh
./install.sh [dir]
```

If `dir` is specified (e.g. `kblocks/topic`) it will only build and install this kblock. Otherwise, it will install all of them.

## License

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

All rights reserved. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright holder, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

For permission requests, please contact the copyright holder.

© 2024 Wing Cloud, Inc. All rights reserved.