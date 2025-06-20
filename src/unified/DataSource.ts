// DataSource provides a contract for fetching data from any source.
export interface DataSource<T = unknown> {
  fetchData(): Promise<T>;
}
