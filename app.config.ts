import type { ExpoConfig } from 'expo/config';

// Merge static `app.json` values so the dynamic config uses them.
// This prevents expo-doctor from warning about duplicate config sources.
let appJson: any = {};
try {
    // require so this works even if TS jsonModule settings differ
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    appJson = require('./app.json').expo || {};
} catch {
    appJson = {};
}

const config: ExpoConfig = {
    ...appJson,
    // override or ensure values that rely on environment variables
    android: {
        ...(appJson.android || {}),
        package: 'com.spacall.client',
    },
    extra: {
        ...(appJson.extra || {}),
        YOUR_SUPABASE_URL_FROM_PHASE_1: process.env.YOUR_SUPABASE_URL_FROM_PHASE_1,
        YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1: process.env.YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1,
        eas: {
            projectId: (appJson.extra && appJson.extra.eas && appJson.extra.eas.projectId) || '01ea5c96-92e1-433f-8517-7650e45f8282',
        },
    },
};

export default config;
