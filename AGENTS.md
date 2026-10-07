# AGENTS.md

## Setup commands
- Install deps: `npm ci`
- Start dev server in community edition: `npm dev`
- Start dev server in enterprise edition: `EDITION=ee npm dev`
- Start dev server in cloud edition: `EDITION=cloud npm dev`
- Build for community edition: `npm run build`
- Build for enterprise edition: `EDITION=ee npm run build`
- Build for cloud edition: `EDITION=cloud npm run build`

## Project structure

### app

Within src/app we declare every page or api.
We've split up the structure to semantic match the page to a specific group.

Under (auth) every page associated with authentication or authorization is placed here.
Under (dashboard) every page associated with the core platform is placed here.
Under (playground) every page associated with the playground environment is placed here.
Under api we define api routes that are needed for configuration or playground.

### packages

Related to our licenses we have 3 different license relevant packages that are also differently mentioned and licensed in our LICENSE file.
In addition, we have a core package that has common shared utilities for every license relevant package.
In general the ce package is the starting package and the ee is build upon ce and cloud is build upon ee. (ce -> ee -> cloud).

Within a package we split it into meaningfully specific services or features.
Every one of those feature folders can have the following sub folders:

- components (const exported React.FC with potential properties or not representing a reusable component that is used more than once and is a mikro component inside a view)
- pages (const exported React.FC page without any props representing a page in app)
- hooks (special self developed react hooks)
- services (everything related to communication with graphql backend)
- utils
- views (const exported React.FC without any properties that represent a part of a page)

It's never allowed to put files directly into a feature folder. Its always needs to be categorized by one of the sub-folders.

You can overwrite one file in a further licensed package (ee or cloud) by simply adding the same file again and changing code.

## Code style

- Our general component/page/view structure is:
  - export const Name(Component/Page/View): React.FC<Name(Component/Page/View)Props> = (props (empty or props for components)) => {
  - const {...} = props
  - all service and store hooks as const
  - all single line react hooks like useState useRef or other singe line hook calls
  - use memos
  - use callbacks
  - use effects
  - return tsx
  - }
- We do not use let always const
- We don't support normal const functions inside components/pages/utils only callbacks are allowed 
- We don't support deep nested functions or variables or general code. Keep it simple and straightforward.
- No nested if's or if-else's
- Variable naming is always meaningfully and in camelcase
- No file should be longer than 250 lines of code.
- No functions or variables outside of component/pages/views declaration. Only interfaces or types are allowed. This is not relevant for utils.
- Do not parse in unnecessary parameters inside functions or components that can also be extracted from useParams
- One function per util file
- Clean naming for util files: Feature.whatItDoes.util.ts (Flow.compare.util.ts)
- Clean naming for hook files: Feature.whatItDoes.hook.ts (Flow.compare.hook.ts)


