" Prettier formatting
let g:prettier#quickfix_enabled = 0
let g:prettier#autoformat = 0

" Write on-save
autocmd BufWritePre *.js,*.jsx,*.mjs,*.ts,*.tsx,*.css,*.less,*.scss,*.json,*.graphql,*.md,*.vue PrettierAsync
