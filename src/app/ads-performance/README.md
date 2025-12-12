# Google Ads Performance Insights

This feature provides performance insights and recommendations for Google Ads campaigns.

## Overview

The Ads Performance page displays key metrics from Google Ads campaigns and generates actionable recommendations based on performance data.

## Current Implementation

The feature is currently implemented with mock data to demonstrate the UI and recommendation engine. The actual Google Ads MCP integration is ready to be connected.

## Files

- **`page.tsx`**: Main UI component displaying performance metrics and recommendations
- **`actions.ts`**: Server actions for fetching data and generating recommendations
- **`README.md`**: This documentation file

## Key Features

### Performance Metrics
- Total Impressions
- Total Clicks
- Click-Through Rate (CTR)
- Total Cost
- Conversions (optional)
- Cost Per Conversion (optional)

### Recommendation Engine

The recommendation engine analyzes performance data and generates actionable insights in the following categories:

1. **Creative**: Ad copy and creative optimization
2. **Budget**: Spending and budget management
3. **Targeting**: Audience and demographic targeting
4. **Bidding**: Bid strategy optimization
5. **Keywords**: Keyword expansion and optimization

Recommendations are prioritized as:
- **High**: Critical issues requiring immediate attention
- **Medium**: Important optimizations with significant impact
- **Low**: Nice-to-have improvements and scaling opportunities

## Google Ads MCP Integration

### Prerequisites

1. Install the Google Ads MCP server (if available)
2. Configure environment variables:
   ```env
   GOOGLE_ADS_CUSTOMER_ID=your_customer_id
   GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
   GOOGLE_ADS_CLIENT_ID=your_client_id
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
   ```

### Integration Steps

1. **Update `actions.ts`**:
   Replace the mock data calls with actual MCP tool calls:

   ```typescript
   import { useMcpTool } from "@/lib/mcp-client"; // Adjust import path

   export async function getGoogleAdsPerformance() {
     const mcpResponse = await useMcpTool({
       server_name: "google-ads",
       tool_name: "get_campaign_performance",
       arguments: {
         customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
         date_range: "LAST_30_DAYS"
       }
     });

     // Transform MCP response to match PerformanceData interface
     const performance: PerformanceData = {
       impressions: mcpResponse.metrics.impressions,
       clicks: mcpResponse.metrics.clicks,
       ctr: `${mcpResponse.metrics.ctr}%`,
       cost: mcpResponse.metrics.cost_micros / 1000000,
       // ... map other fields
     };

     return {
       performance,
       recommendations: generateRecommendations(performance)
     };
   }
   ```

2. **Available MCP Tools** (example - adjust based on actual MCP):
   - `get_campaign_performance`: Fetch campaign metrics
   - `get_campaigns`: List all campaigns with stats
   - `get_ad_groups`: Fetch ad group performance
   - `get_keywords`: Retrieve keyword performance data
   - `get_search_terms`: Get search term reports

3. **Data Transformation**:
   Ensure the MCP response is transformed to match the TypeScript interfaces defined in `actions.ts`:
   - `PerformanceData`
   - `CampaignData`
   - `Recommendation`

## Future Enhancements

### Planned Features
1. **Campaign Breakdown**: Detailed view of individual campaign performance
2. **Keyword Analysis**: Top performing and underperforming keywords
3. **Ad Copy Testing**: A/B test results and recommendations
4. **Budget Forecasting**: Predictive analytics for budget planning
5. **Automated Alerts**: Email/Slack notifications for critical issues
6. **Historical Trends**: Charts showing performance over time
7. **Competitor Analysis**: Benchmark against industry standards
8. **Export Reports**: PDF/Excel export of insights

### Additional Metrics to Track
- Quality Score
- Conversion Rate
- Return on Ad Spend (ROAS)
- Cost Per Click (CPC)
- Average Position
- Search Impression Share

## API Reference

### `getGoogleAdsPerformance()`
Fetches overall performance metrics and generates recommendations.

**Returns:**
```typescript
{
  performance: PerformanceData;
  recommendations: Recommendation[];
  campaigns?: CampaignData[];
}
```

### `getCampaignPerformance()`
Fetches detailed performance data for all campaigns.

**Returns:** `CampaignData[]`

### `getKeywordPerformance()`
Fetches keyword-level performance data.

**Returns:** `KeywordData[]` (to be implemented)

## Troubleshooting

### Common Issues

1. **No data displayed**: Check that the MCP server is running and credentials are configured
2. **Stale data**: Implement caching with appropriate TTL
3. **Rate limiting**: Implement request throttling for Google Ads API

### Debug Mode

To enable debug logging, add to your environment:
```env
DEBUG_GOOGLE_ADS=true
```

## Contributing

When adding new features:
1. Update TypeScript interfaces in `actions.ts`
2. Add corresponding UI components in `page.tsx`
3. Update this README with new functionality
4. Add tests for new recommendation logic

## License

Internal use only - Marka Internal Tools