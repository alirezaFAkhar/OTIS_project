/**
 * Get safe column name from environment variable
 */
export function safeColumnName(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Get all payment-related column names
 */
export function getPaymentColumns() {
  const membersIdColumn = safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id');

  return {
    membersIdColumn,
    paymentsTable: safeColumnName(process.env.PAYMENTS_TABLE, 'Payments'),
    paymentsMemberIdColumn: safeColumnName(
      process.env.PAYMENTS_MEMBER_ID_COLUMN,
      membersIdColumn
    ),
    paymentsComplexIdColumn: safeColumnName(
      process.env.PAYMENTS_COMPLEX_ID_COLUMN,
      'ComplexId'
    ),
    paymentsPayDateColumn: safeColumnName(
      process.env.PAYMENTS_PAY_DATE_COLUMN,
      'PayDate'
    ),
    paymentsAddDateColumn: safeColumnName(
      process.env.PAYMENTS_ADD_DATE_COLUMN,
      'AddDate'
    ),
    paymentsTrackingNumberColumn: safeColumnName(
      process.env.PAYMENTS_TRACKING_NUMBER_COLUMN,
      'TrackingNumber'
    ),
    paymentsAmountColumn: safeColumnName(
      process.env.PAYMENTS_AMOUNT_COLUMN,
      'PayedPrice'
    ),
    paymentsCreditColumn: safeColumnName(
      process.env.PAYMENTS_CREDIT_COLUMN,
      'Credit'
    ),
    paymentsStatusColumn: safeColumnName(
      process.env.PAYMENTS_STATUS_COLUMN,
      'Status'
    ),
    paymentsPayTypeColumn: safeColumnName(
      process.env.PAYMENTS_PAY_TYPE_COLUMN,
      'PayType'
    ),
  };
}



