<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Easebeyond Sitemap</title>
        <style>
          :root {
            color-scheme: dark;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          body {
            max-width: 1120px;
            margin: 0 auto;
            padding: 48px 20px;
            color: #e8edf5;
            background: #0a0f18;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 30px;
          }
          p {
            margin: 0 0 28px;
            color: #9eabc0;
          }
          .table-wrap {
            overflow-x: auto;
            border: 1px solid #263247;
            border-radius: 12px;
            background: #101827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 14px 16px;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid #263247;
          }
          th {
            color: #b8c6dc;
            background: #151f31;
          }
          tr:last-child td {
            border-bottom: 0;
          }
          a {
            color: #8bc5ff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .alternate {
            display: inline-block;
            margin: 2px 10px 2px 0;
            white-space: nowrap;
          }
          .language {
            color: #73e2a7;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <h1>Easebeyond Sitemap</h1>
        <p>
          <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
          localized pages available.
        </p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Page URL</th>
                <th>Language alternatives</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:for-each select="xhtml:link">
                      <span class="alternate">
                        <span class="language">
                          <xsl:value-of select="@hreflang"/>
                        </span>
                        <xsl:text> · </xsl:text>
                        <a href="{@href}">open</a>
                      </span>
                    </xsl:for-each>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
