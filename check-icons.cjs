// Quick script to list available lucide-react icon names
const path = require('path');
const lucide = require(path.join(process.cwd(), 'node_modules', 'lucide-react'));
const icons = Object.keys(lucide).filter(k => typeof lucide[k] === 'object' || typeof lucide[k] === 'function');
// Check specific icons we need
const needed = [
  'Shield', 'Twitter', 'Linkedin', 'Instagram', 'Youtube', 'Globe', 'Play',
  'Menu', 'X', 'Search', 'MapPin', 'Star', 'Users', 'Clock', 'CreditCard',
  'ArrowRight', 'BadgeCheck', 'Calculator', 'FileText', 'ChevronRight', 'Zap',
  'ShieldCheck', 'Check', 'Briefcase', 'SlidersHorizontal', 'ArrowUpDown',
  'Mail', 'Lock', 'User', 'Eye', 'EyeOff', 'Phone', 'MessageCircle',
  'Calendar', 'Award'
];
needed.forEach(name => {
  console.log(name + ': ' + (lucide[name] ? 'YES' : 'NO'));
});
