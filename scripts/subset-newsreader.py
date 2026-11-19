"""Makes src/assets/fonts/newsreader-logo.woff2: Newsreader at its extrabold weight, with only
the letters the site sets in it ("ijji labs", "admin", "ij").

Newsreader appears only in the wordmark, the home hero and the studio mark, so the full
variable font (58 KB) is cut down to a few KB, small enough to preload on every page.

If Newsreader is ever used for other text, add its letters to TEXT and run this again:

    python -m pip install fonttools brotli
    python scripts/subset-newsreader.py

Characters not in the subset would fall back to the next font in --font-newsreader (serif).
"""

import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2'
TARGET = ROOT / 'src/assets/fonts/newsreader-logo.woff2'

# Every letter set in Newsreader (lower and upper case, for safety) and the space.
TEXT = 'ijlabsdmn' + 'ijlabsdmn'.upper() + ' '
WEIGHT = 800  # font-extrabold

font = TTFont(SOURCE)
# The one weight the site uses, as a static font: smaller than the variable one.
static = instancer.instantiateVariableFont(font, {'wght': WEIGHT})

options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['kern', 'liga', 'calt']
options.name_IDs = ['*']
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(text=TEXT)
subsetter.subset(static)

TARGET.parent.mkdir(parents=True, exist_ok=True)
buffer = io.BytesIO()
static.flavor = 'woff2'
static.save(buffer)
TARGET.write_bytes(buffer.getvalue())
print(f'{TARGET.relative_to(ROOT)}: {len(buffer.getvalue())} bytes')
