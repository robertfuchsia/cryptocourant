import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("CryptoCourant")
    .items([
      S.listItem()
        .title("Artikelen")
        .child(
          S.list()
            .title("Artikelen")
            .items([
              S.listItem()
                .title("Nederlands")
                .child(
                  S.documentTypeList("post")
                    .title("Nederlandse artikelen")
                    .filter('_type == "post" && language == "nl"')
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                    .initialValueTemplates([])
                ),
              S.listItem()
                .title("English")
                .child(
                  S.documentTypeList("post")
                    .title("English articles")
                    .filter('_type == "post" && language == "en"')
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                    .initialValueTemplates([])
                ),
              S.divider(),
              S.listItem()
                .title("Zonder vertaling")
                .child(
                  S.documentTypeList("post")
                    .title("Nog niet vertaald")
                    .filter('_type == "post" && !defined(translation)')
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem("category").title("Categorieën"),
      S.documentTypeListItem("author").title("Auteurs"),
      S.documentTypeListItem("page").title("Losse pagina's"),
      S.divider(),
      S.listItem()
        .title("Site-instellingen")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
    ]);
