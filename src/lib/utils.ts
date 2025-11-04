// A simplified version of clsx
function clsx(...args: any[]): string {
  let str = '';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      str += (str ? ' ' : '') + arg;
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = clsx(...arg);
        if (inner) {
            str += (str ? ' ' : '') + inner;
        }
      }
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
          str += (str ? ' ' : '') + key;
        }
      }
    }
  }
  return str;
}


// A very simplified tailwind-merge
function twMerge(classString: string): string {
    const classes = classString.split(/\s+/);
    const classMap: Record<string, string> = {};

    classes.forEach(cls => {
        if (!cls) return;
        
        // This is a naive prefix extraction, e.g., 'bg-' from 'bg-red-500'
        // or 'text-' from 'text-lg'. It won't handle complex cases.
        const firstDashIndex = cls.indexOf('-');
        const prefix = firstDashIndex !== -1 ? cls.substring(0, firstDashIndex) : cls;

        // More specific prefixes for better conflict resolution
        const specialPrefixes = ['p', 'm', 'w', 'h', 'text', 'bg', 'border', 'flex', 'grid', 'rounded'];
        let baseKey = prefix;

        for (const sp of specialPrefixes) {
            if (cls.startsWith(sp + '-') || cls === sp) {
                baseKey = sp;
                break;
            }
        }
        
        // For properties like 'font-bold', the key is the whole class
        if (['font', 'items', 'justify'].includes(prefix)) {
             classMap[cls] = cls;
        } else {
             classMap[baseKey] = cls;
        }
    });

    return Object.values(classMap).join(' ');
}


export function cn(...inputs: (string | undefined | null | false | Record<string, any> | any[])[]) {
  return twMerge(clsx(inputs));
}
