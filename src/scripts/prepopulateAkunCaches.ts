import {activeCaches} from "../Cache";
import {prepopulateStoryCache} from "../commands/handlers/akun/config";

async function prepopulateAkunCaches() {
  try {
    await prepopulateStoryCache();
  } catch (err) {
    console.error(err);
  }
  // Close any long-running cache loops
  for (const cache of activeCaches.values()) {
    console.log(`Finishing cache ${cache.id}`);
    await cache.finish();
  }
}

prepopulateAkunCaches().catch(console.error);
