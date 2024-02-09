# Bot1

```bash
PUPPETEER_SKIP_DOWNLOAD=1 yarn --registry=https://registry.npmmirror.com
```

```bash

```

## Run

```bash
docker run -ti --volume="$(pwd)":/bot --volume=/apps:/apps wechaty/wechaty start
```

## Enum

```ts
const types = {
  Unknown: 0,
  Attachment: 1,
  Audio: 2,
  Contact: 3,
  ChatHistory: 4,
  Emoticon: 5,
  Image: 6,
  Text: 7,
  Location: 8,
  MiniProgram: 9,
  GroupNote: 10,
  Transfer: 11,
  RedEnvelope: 12,
  Recalled: 13,
  Url: 14,
  Video: 15,
  Post: 16,
};
```
