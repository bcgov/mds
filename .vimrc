" Prettier formatting
" when running at every change you may want to disable quickfix
let g:prettier#quickfix_enabled = 0
let g:prettier#autoformat = 0

" On Save -- prettier
autocmd BufWritePre *.js,*.jsx,*.mjs,*.ts,*.tsx,*.css,*.less,*.scss,*.json,*.graphql,*.md,*.vue PrettierAsync
