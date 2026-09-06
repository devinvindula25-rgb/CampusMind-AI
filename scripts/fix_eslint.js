const fs = require('fs');

const files = {
  'app/(institutional)/index.tsx': [
    ['"Academic Integrity Policy v2"', '&quot;Academic Integrity Policy v2&quot;']
  ],
  'app/(tabs)/burnout.tsx': [
    ["This Week's Working Hours", 'This Week&apos;s Working Hours']
  ],
  'app/(tabs)/index.tsx': [
    ["Today's Schedule", 'Today&apos;s Schedule']
  ],
  'app/(tabs)/meetings.tsx': [
    ['"New"', '&quot;New&quot;']
  ],
  'app/(tabs)/notifications.tsx': [
    ["You're all caught up!", 'You&apos;re all caught up!']
  ],
  'app/(tabs)/teaching.tsx': [
    ['"{fb.comment}"', '&quot;{fb.comment}&quot;']
  ],
  'app/login.tsx': [
    ["Don't have an account?", 'Don&apos;t have an account?']
  ],
  'components/FocusMode.tsx': [
    ['"Deep work is the ability to focus without distraction on a cognitively demanding task."', '&quot;Deep work is the ability to focus without distraction on a cognitively demanding task.&quot;']
  ]
};

for (const [file, replacements] of Object.entries(files)) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [find, repl] of replacements) {
    content = content.replace(find, repl);
  }
  fs.writeFileSync(file, content);
}
console.log('Fixed ESLint issues.');
