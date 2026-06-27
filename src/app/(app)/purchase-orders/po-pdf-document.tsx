// True multi-page PDF of the PO (react-pdf). Loaded only on demand from the
// download button, so @react-pdf/renderer never enters the SSR/server bundle.
// Layout mirrors the JimiFern PO template: header, title, PO no, order details,
// items table (header repeats per page, rows never split), summary, notes,
// authorization, and a fixed footer with page numbers.
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Database } from '@/lib/database.types'
import type { LineStage } from './po-stage-pipeline'

type PO = Database['public']['Tables']['purchase_orders']['Row']
type Buyer = { name: string | null; country: string | null; address: string | null; email: string | null } | null
type Company = Database['public']['Tables']['company_settings']['Row'] | null

export type PoPdfProps = {
  po: PO
  buyer: Buyer
  lines: LineStage[]
  totalCbm: number
  company: Company
  logoUrl: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const [, y, mo, d] = m
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`
}

const BORDER = '#d4d4d4'
const INK = '#171717'
const MUTED = '#525252'

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 54,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: INK,
  },

  // Header
  header: { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 9, marginBottom: 12 },
  logo: { height: 40, objectFit: 'contain', marginBottom: 4 },
  seller: { fontSize: 7.5, color: MUTED, textAlign: 'center' },

  // Title
  titleWrap: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  subtitle: { fontSize: 7.5, letterSpacing: 3, color: MUTED, marginTop: 3 },

  // PO number
  poBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  poLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#404040' },
  poNo: { fontSize: 20, fontFamily: 'Helvetica-Bold' },

  // Section header bar
  sectionBar: {
    borderWidth: 0.5,
    borderColor: BORDER,
    backgroundColor: '#f5f5f5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    color: '#404040',
    textTransform: 'uppercase',
  },
  sectionBody: { borderWidth: 0.5, borderTopWidth: 0, borderColor: BORDER, padding: 10 },

  // Order details grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailCell: { width: '50%', flexDirection: 'row', paddingVertical: 3, paddingRight: 8 },
  detailLabel: { fontFamily: 'Helvetica-Bold' },
  detailColon: { color: '#a3a3a3', marginHorizontal: 4 },
  detailValue: { color: '#262626', flexShrink: 1 },

  // Items table
  table: { borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: BORDER, marginBottom: 14 },
  row: { flexDirection: 'row' },
  cell: {
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: BORDER,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  headCell: { backgroundColor: '#f5f5f5', fontFamily: 'Helvetica-Bold' },
  cPhoto: { width: '15%', alignItems: 'center' },
  cSku: { width: '14%' },
  cItem: { width: '20%' },
  cDesc: { width: '29%' },
  cQty: { width: '11%', textAlign: 'center' },
  cCbm: { width: '11%', textAlign: 'right' },
  photo: { height: 34, width: 46, objectFit: 'contain' },
  photoEmpty: { color: '#a3a3a3' },

  // Two-column row (summary + notes)
  twoCol: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  sumRow: { flexDirection: 'row', paddingVertical: 3 },
  sumLabel: { fontFamily: 'Helvetica-Bold' },
  sumValue: { fontFamily: 'Helvetica-Bold' },
  noteLine: { borderBottomWidth: 0.5, borderColor: BORDER, height: 14, marginBottom: 6 },

  // Authorization
  authGrid: { flexDirection: 'row', gap: 20 },
  authCol: { flex: 1 },
  authRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  authLabel: { fontFamily: 'Helvetica-Bold', marginRight: 4 },
  authLine: { flex: 1, borderBottomWidth: 0.7, borderColor: '#737373', height: 10 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 30,
    right: 30,
    borderTopWidth: 0.5,
    borderColor: BORDER,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 7.5,
    color: MUTED,
  },
  footerContact: { flexDirection: 'row', gap: 12 },
})

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={s.detailCell}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailColon}>:</Text>
      <Text style={s.detailValue}>{value || '—'}</Text>
    </View>
  )
}

function SignBlock({ label }: { label: string }) {
  return (
    <View style={s.authCol}>
      <View style={s.authRow}>
        <Text style={s.authLabel}>{label}</Text>
        <Text style={{ marginRight: 4 }}>:</Text>
        <View style={s.authLine} />
      </View>
      <View style={s.authRow}>
        <Text style={s.authLabel}>Date</Text>
        <Text style={{ marginRight: 4 }}>:</Text>
        <View style={s.authLine} />
      </View>
    </View>
  )
}

export function PoPdfDocument({ po, buyer, lines, totalCbm, company, logoUrl }: PoPdfProps) {
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0)
  const sellerLine = [company?.address, company?.city, company?.gstin ? `GSTIN: ${company.gstin}` : null]
    .filter(Boolean)
    .join('   ·   ')
  const contact = [company?.website, company?.email, company?.phone].filter(Boolean)

  return (
    <Document title={`Purchase Order ${po.po_no}`}>
      <Page size="A4" style={s.page} wrap>
        {/* Header */}
        <View style={s.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoUrl} style={s.logo} />
          {sellerLine ? <Text style={s.seller}>{sellerLine}</Text> : null}
        </View>

        {/* Title */}
        <View style={s.titleWrap}>
          <Text style={s.title}>PURCHASE ORDER</Text>
          <Text style={s.subtitle}>P.O.</Text>
        </View>

        {/* PO number */}
        <View style={s.poBox}>
          <Text style={s.poLabel}>P.O. NUMBER:</Text>
          <Text style={s.poNo}>{po.po_no}</Text>
        </View>

        {/* Order details */}
        <View wrap={false}>
          <Text style={s.sectionBar}>Order Details</Text>
          <View style={[s.sectionBody, s.detailGrid]}>
            <Detail label="Buyer Name" value={buyer?.name} />
            <Detail label="Shipping Country" value={po.shipping_country ?? buyer?.country} />
            <Detail label="Inspection Date" value={fmtDate(po.inspection_date)} />
            <Detail label="Shipping Date" value={fmtDate(po.delivery_date)} />
          </View>
        </View>

        <View style={{ height: 14 }} />

        {/* Items table */}
        <View style={s.table}>
          {/* Header row repeats on every page */}
          <View style={s.row} fixed>
            <Text style={[s.cell, s.headCell, s.cPhoto]}>Photo</Text>
            <Text style={[s.cell, s.headCell, s.cSku]}>SKU No.</Text>
            <Text style={[s.cell, s.headCell, s.cItem]}>Item</Text>
            <Text style={[s.cell, s.headCell, s.cDesc]}>Description</Text>
            <Text style={[s.cell, s.headCell, s.cQty]}>Quantity</Text>
            <Text style={[s.cell, s.headCell, s.cCbm]}>CBM (Total)</Text>
          </View>

          {lines.length === 0 ? (
            <View style={s.row}>
              <Text style={[s.cell, { width: '100%', textAlign: 'center', color: MUTED, paddingVertical: 10 }]}>
                No items on this PO.
              </Text>
            </View>
          ) : (
            lines.map((l) => (
              <View key={l.lineItemId} style={s.row} wrap={false}>
                <View style={[s.cell, s.cPhoto]}>
                  {l.photoUrl ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image src={l.photoUrl} style={s.photo} />
                  ) : (
                    <Text style={s.photoEmpty}>—</Text>
                  )}
                </View>
                <Text style={[s.cell, s.cSku, { fontFamily: 'Helvetica-Bold' }]}>{l.skuNo}</Text>
                <Text style={[s.cell, s.cItem]}>{l.skuName}</Text>
                <Text style={[s.cell, s.cDesc, { color: '#404040' }]}>{l.description ?? '—'}</Text>
                <Text style={[s.cell, s.cQty]}>{l.qty} PCS</Text>
                <Text style={[s.cell, s.cCbm]}>{l.cbm}</Text>
              </View>
            ))
          )}
        </View>

        {/* Summary + Notes */}
        <View style={s.twoCol} wrap={false}>
          <View style={s.col}>
            <Text style={s.sectionBar}>Summary</Text>
            <View style={s.sectionBody}>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Total CBM</Text>
                <Text style={s.detailColon}>:</Text>
                <Text style={s.sumValue}>{totalCbm}</Text>
              </View>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Total Quantity</Text>
                <Text style={s.detailColon}>:</Text>
                <Text style={s.sumValue}>{totalQty} PCS</Text>
              </View>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.sectionBar}>Notes</Text>
            <View style={s.sectionBody}>
              <View style={s.noteLine} />
              <View style={s.noteLine} />
              <View style={[s.noteLine, { marginBottom: 0 }]} />
            </View>
          </View>
        </View>

        {/* Authorization */}
        <View wrap={false}>
          <Text style={s.sectionBar}>Authorization</Text>
          <View style={[s.sectionBody, s.authGrid]}>
            <SignBlock label="Prepared By" />
            <SignBlock label="Approved By" />
            <SignBlock label="Signature" />
          </View>
        </View>

        {/* Footer — fixed on every page */}
        <View style={s.footer} fixed>
          <View style={s.footerContact}>
            {contact.map((c, i) => (
              <Text key={i}>{c}</Text>
            ))}
          </View>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
