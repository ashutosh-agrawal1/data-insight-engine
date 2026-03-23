import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import Any
import json

app = fastapi.FastAPI()

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    data: list[dict[str, Any]]


class ColumnInfo(BaseModel):
    name: str
    type: str  # "Numerical", "Categorical", "Date", "Text"
    unique: int
    missing: int
    sample: list[str]


class StatisticalSummary(BaseModel):
    column: str
    mean: float
    median: float
    std_dev: float
    min_val: float
    max_val: float
    skewness: float
    kurtosis: float


class CorrelationPair(BaseModel):
    column1: str
    column2: str
    correlation: float


class CategoryCount(BaseModel):
    column: str
    value_counts: dict[str, int]


class AnalysisResponse(BaseModel):
    rows: int
    columns: int
    column_info: list[ColumnInfo]
    missing_summary: dict[str, int]
    statistical_summary: list[StatisticalSummary]
    correlation_matrix: list[CorrelationPair]
    top_categories: list[CategoryCount]


def detect_column_type(series: pd.Series) -> str:
    """Detect the type of a column based on its values."""
    non_null = series.dropna()
    if len(non_null) == 0:
        return "Text"
    
    # Check if numeric
    try:
        numeric_series = pd.to_numeric(non_null, errors='coerce')
        numeric_ratio = numeric_series.notna().sum() / len(non_null)
        if numeric_ratio > 0.8:
            return "Numerical"
    except Exception:
        pass
    
    # Check for dates
    try:
        # Sample first few values to check for date patterns
        sample = non_null.head(100).astype(str)
        date_count = 0
        for val in sample:
            try:
                pd.to_datetime(val)
                date_count += 1
            except Exception:
                pass
        if date_count / len(sample) > 0.8:
            return "Date"
    except Exception:
        pass
    
    # Check for categorical (low cardinality)
    unique_ratio = non_null.nunique() / len(non_null)
    if unique_ratio < 0.1 or non_null.nunique() <= 20:
        return "Categorical"
    
    return "Text"


def calculate_skewness(values: np.ndarray) -> float:
    """Calculate skewness of a distribution."""
    if len(values) < 3:
        return 0.0
    n = len(values)
    mean = np.mean(values)
    m3 = np.sum((values - mean) ** 3) / n
    m2 = np.sum((values - mean) ** 2) / n
    s = np.sqrt(m2)
    if s == 0:
        return 0.0
    return float(m3 / (s ** 3))


def calculate_kurtosis(values: np.ndarray) -> float:
    """Calculate excess kurtosis of a distribution."""
    if len(values) < 4:
        return 0.0
    n = len(values)
    mean = np.mean(values)
    m4 = np.sum((values - mean) ** 4) / n
    m2 = np.sum((values - mean) ** 2) / n
    if m2 == 0:
        return 0.0
    return float(m4 / (m2 ** 2) - 3)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_data(request: AnalyzeRequest) -> AnalysisResponse:
    """
    Perform exploratory data analysis on the provided dataset.
    
    Input: dataset as JSON (array of objects)
    Returns: comprehensive EDA results including statistics, correlations, etc.
    """
    data = request.data
    
    if not data:
        raise fastapi.HTTPException(status_code=400, detail="Empty dataset provided")
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Basic info
    num_rows = len(df)
    num_columns = len(df.columns)
    
    # Analyze columns
    column_info_list: list[ColumnInfo] = []
    numerical_columns: list[str] = []
    categorical_columns: list[str] = []
    
    for col in df.columns:
        col_type = detect_column_type(df[col])
        unique_count = df[col].nunique()
        missing_count = df[col].isna().sum() + (df[col] == '').sum()
        
        # Get sample values
        non_null = df[col].dropna()
        sample_vals = non_null.head(5).astype(str).tolist()
        
        column_info_list.append(ColumnInfo(
            name=str(col),
            type=col_type,
            unique=int(unique_count),
            missing=int(missing_count),
            sample=sample_vals
        ))
        
        if col_type == "Numerical":
            numerical_columns.append(str(col))
        elif col_type == "Categorical":
            categorical_columns.append(str(col))
    
    # Missing values summary
    missing_summary: dict[str, int] = {}
    for col in df.columns:
        missing = int(df[col].isna().sum() + (df[col] == '').sum())
        if missing > 0:
            missing_summary[str(col)] = missing
    
    # Statistical summary for numerical columns
    statistical_summary: list[StatisticalSummary] = []
    for col in numerical_columns[:10]:  # Limit to first 10 numerical columns
        try:
            # Convert to numeric, coercing errors
            numeric_vals = pd.to_numeric(df[col].astype(str).str.replace(r'[$,]', '', regex=True), errors='coerce')
            clean_vals = numeric_vals.dropna().values
            
            if len(clean_vals) > 0:
                statistical_summary.append(StatisticalSummary(
                    column=col,
                    mean=float(np.mean(clean_vals)),
                    median=float(np.median(clean_vals)),
                    std_dev=float(np.std(clean_vals)),
                    min_val=float(np.min(clean_vals)),
                    max_val=float(np.max(clean_vals)),
                    skewness=calculate_skewness(clean_vals),
                    kurtosis=calculate_kurtosis(clean_vals)
                ))
        except Exception:
            continue
    
    # Correlation matrix for numerical columns
    correlation_pairs: list[CorrelationPair] = []
    if len(numerical_columns) >= 2:
        # Create a numeric dataframe
        numeric_df = pd.DataFrame()
        for col in numerical_columns[:6]:  # Limit for performance
            try:
                numeric_df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(r'[$,]', '', regex=True), 
                    errors='coerce'
                )
            except Exception:
                continue
        
        if len(numeric_df.columns) >= 2:
            # Calculate correlation matrix
            corr_matrix = numeric_df.corr()
            
            # Extract pairs
            cols = corr_matrix.columns.tolist()
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    corr_val = corr_matrix.iloc[i, j]
                    if not np.isnan(corr_val):
                        correlation_pairs.append(CorrelationPair(
                            column1=cols[i],
                            column2=cols[j],
                            correlation=float(corr_val)
                        ))
    
    # Top categories for categorical columns
    top_categories: list[CategoryCount] = []
    for col in categorical_columns[:5]:  # Limit to first 5 categorical columns
        try:
            value_counts = df[col].value_counts().head(10).to_dict()
            # Convert keys to strings and values to int
            clean_counts = {str(k): int(v) for k, v in value_counts.items()}
            top_categories.append(CategoryCount(
                column=col,
                value_counts=clean_counts
            ))
        except Exception:
            continue
    
    return AnalysisResponse(
        rows=num_rows,
        columns=num_columns,
        column_info=column_info_list,
        missing_summary=missing_summary,
        statistical_summary=statistical_summary,
        correlation_matrix=correlation_pairs,
        top_categories=top_categories
    )
