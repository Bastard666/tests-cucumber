package io.testscucumber.backend.shared.domain;

public class Argument {

    private String value;

    private int offset;

    public String getValue() {
        return value;
    }

    public void setValue(final String value) {
        this.value = value;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(final int offset) {
        this.offset = offset;
    }

}
