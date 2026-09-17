package com.server.taskservice.model;


//Types of notifications
public enum NotificationType {

    CARD_CREATED,
    CARD_UPDATED,
    CARD_MOVED,
    CARD_DELETED,
    CARD_ASSIGNED,
    CARD_UNASSIGNED,
    CARD_DUE_SOON,
    CARD_DUE,

    LIST_CREATED,
    LIST_UPDATED,
    LIST_MOVED,
    LIST_DELETED
}