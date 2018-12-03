// https://developers.google.com/gtagjs/reference/event
// https://support.google.com/analytics/answer/1033068#Anatomy
// https://developers.google.com/analytics/devguides/collection/gtagjs/events
// https://developers.google.com/analytics/devguides/collection/gtagjs/migration#mapping_analyticsjs_fields_to_gtagjs_parameters


export function sendEvent(category: string, action: string, label: string, value?: number) {
  gtag('event', action, {
    'event_category': category,
    'event_label': label,
    'value': value,
  });
}
