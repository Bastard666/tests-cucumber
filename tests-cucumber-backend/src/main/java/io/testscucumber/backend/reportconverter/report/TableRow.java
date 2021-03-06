package io.testscucumber.backend.reportconverter.report;

import com.google.common.base.MoreObjects;

import java.util.ArrayList;
import java.util.List;

public class TableRow {

    private List<String> cells = new ArrayList<>();

    private long line;

    public List<String> getCells() {
        return cells;
    }

    public void setCells(final List<String> cells) {
        this.cells = cells;
    }

    public long getLine() {
        return line;
    }

    public void setLine(final long line) {
        this.line = line;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("cells", cells)
                .add("line", line)
                .toString();
    }

}
