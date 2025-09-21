import type {StructureResolver} from 'sanity/structure'
import {DocumentIcon, BookIcon, TagIcon, UserIcon, TrendUpwardIcon} from '@sanity/icons'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Pootdee Content Management')
    .items([
      // Phrases section with enhanced organization
      S.listItem()
        .title('Phrases')
        .icon(BookIcon)
        .child(
          S.list()
            .title('Phrase Management')
            .items([
              // All phrases
              S.listItem()
                .title('All Phrases')
                .icon(DocumentIcon)
                .child(
                  S.documentTypeList('phrase')
                    .title('All Phrases')
                    .filter('_type == "phrase"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                ),
              
              // Phrases by difficulty
              S.listItem()
                .title('By Difficulty')
                .icon(TrendUpwardIcon)
                .child(
                  S.list()
                    .title('Phrases by Difficulty')
                    .items([
                      S.listItem()
                        .title('Beginner')
                        .child(
                          S.documentTypeList('phrase')
                            .title('Beginner Phrases')
                            .filter('_type == "phrase" && difficulty == "beginner"')
                            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                        ),
                      S.listItem()
                        .title('Intermediate')
                        .child(
                          S.documentTypeList('phrase')
                            .title('Intermediate Phrases')
                            .filter('_type == "phrase" && difficulty == "intermediate"')
                            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                        ),
                      S.listItem()
                        .title('Advanced')
                        .child(
                          S.documentTypeList('phrase')
                            .title('Advanced Phrases')
                            .filter('_type == "phrase" && difficulty == "advanced"')
                            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                        ),
                    ])
                ),
              
              // Bookmarked phrases
              S.listItem()
                .title('Bookmarked Phrases')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('phrase')
                    .title('Bookmarked Phrases')
                    .filter('_type == "phrase" && isBookmarked == true')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                ),
              
              // Recent phrases (last 7 days)
              S.listItem()
                .title('Recent Phrases')
                .child(
                  S.documentTypeList('phrase')
                    .title('Recent Phrases (Last 7 Days)')
                    .filter('_type == "phrase" && _createdAt > dateTime(now()) - 60*60*24*7')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                ),
              
              // Phrases needing review (high review count)
              S.listItem()
                .title('Needs Review')
                .child(
                  S.documentTypeList('phrase')
                    .title('Phrases Needing Review')
                    .filter('_type == "phrase" && reviewCount > 5')
                    .defaultOrdering([{field: 'reviewCount', direction: 'desc'}])
                ),
            ])
        ),
      
      // Users section (if user management is needed)
      S.listItem()
        .title('Users')
        .icon(UserIcon)
        .child(
          S.documentTypeList('user')
            .title('All Users')
            .filter('_type == "user"')
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
        ),
      
      // Divider
      S.divider(),
      
      // Other document types (auto-generated)
      ...S.documentTypeListItems().filter(
        (listItem) => !['phrase', 'user'].includes(listItem.getId() || '')
      ),
    ])
